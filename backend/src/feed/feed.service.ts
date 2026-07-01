import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { FeedTypeTag } from './models/feed-item.union';

export interface FeedRow {
  __feedType: FeedTypeTag;
  createdAt: Date;
  [key: string]: unknown;
}

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * One page of the unified news feed: posts, events, and every vendor
   * content type merged newest-first. Cursor pagination by createdAt — each
   * source is asked for `limit` rows older than the cursor, the merged list
   * is sorted and cut to `limit`, and the last row's createdAt becomes the
   * next cursor. Ties (identical timestamps) are rare enough at this scale
   * to accept.
   */
  async page(cursor: Date | null, limit = 15) {
    const createdAt = cursor ? { lt: cursor } : undefined;
    const common = {
      where: createdAt ? { createdAt } : undefined,
      orderBy: { createdAt: 'desc' as const },
      take: limit,
    };

    const [
      posts,
      events,
      designs,
      offers,
      offerings,
      works,
      floristItems,
      requests,
    ] = await Promise.all([
      this.prisma.post.findMany({
        ...common,
        include: {
          author: true,
          page: { include: { owner: true } },
          media: true,
        },
      }),
      this.prisma.event.findMany({
        ...common,
        include: { author: true, page: { include: { owner: true } } },
      }),
      this.prisma.design.findMany({
        ...common,
        include: {
          page: { include: { owner: true } },
          images: { orderBy: { order: 'asc' } },
        },
      }),
      this.prisma.cateringOffer.findMany({
        ...common,
        include: {
          page: { include: { owner: true } },
          images: { orderBy: { order: 'asc' } },
        },
      }),
      this.prisma.offering.findMany({
        ...common,
        include: {
          page: { include: { owner: true } },
          images: { orderBy: { order: 'asc' } },
        },
      }),
      this.prisma.work.findMany({
        ...common,
        include: {
          page: { include: { owner: true } },
          media: { orderBy: { order: 'asc' } },
        },
      }),
      this.prisma.floristItem.findMany({
        ...common,
        include: {
          page: { include: { owner: true } },
          images: { orderBy: { order: 'asc' } },
        },
      }),
      this.prisma.request.findMany({
        ...common,
        include: { author: true },
      }),
    ]);

    const tag = <T extends { createdAt: Date }>(
      rows: T[],
      type: FeedTypeTag,
    ): FeedRow[] => rows.map((r) => ({ ...r, __feedType: type }));

    const merged: FeedRow[] = [
      ...tag(posts, 'POST'),
      ...tag(events, 'EVENT'),
      ...tag(designs, 'DESIGN'),
      ...tag(offers, 'CATERING_OFFER'),
      ...tag(offerings, 'OFFERING'),
      ...tag(works, 'WORK'),
      ...tag(floristItems, 'FLORIST_ITEM'),
      ...tag(requests, 'REQUEST'),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const items = merged.slice(0, limit);
    const hasMore = merged.length > limit;
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].createdAt : null,
      hasMore,
    };
  }
}
