import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PagesService } from '../pages/pages.service';
import { CreateOfferingInput } from './dto/create-offering.input';
import { UpdateOfferingInput } from './dto/update-offering.input';

// Every offering we return carries its page (for the "by <page>" line) and
// its photos in upload order.
const offeringInclude = {
  page: { include: { owner: true } },
  images: { orderBy: { order: 'asc' } },
} as const;

@Injectable()
export class OfferingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pages: PagesService,
  ) {}

  /**
   * Publish an offering under one of `authorId`'s pages. The page must be a
   * MUSIC_SOUND page — other vendor types have their own flows.
   */
  async create(authorId: string, input: CreateOfferingInput) {
    const page = await this.pages.assertOwned(authorId, input.pageId);
    if (!page.types.includes(PageType.MUSIC_SOUND)) {
      throw new BadRequestException(
        'Only music & sound pages can publish offerings',
      );
    }
    return this.prisma.offering.create({
      data: {
        pageId: page.id,
        title: input.title.trim(),
        kind: input.kind.trim(),
        description: input.description?.trim() || null,
        priceFrom: input.priceFrom ?? null,
        images: {
          create: input.imageUrls.map((url, order) => ({
            url: url.trim(),
            order,
          })),
        },
      },
      include: offeringInclude,
    });
  }

  /** Update an offering — only the owner of its page may. */
  async update(authorId: string, input: UpdateOfferingInput) {
    const offering = await this.prisma.offering.findUnique({
      where: { id: input.offeringId },
      include: { page: true },
    });
    if (!offering) {
      throw new NotFoundException('Offering not found');
    }
    if (offering.page.ownerId !== authorId) {
      throw new ForbiddenException(
        'You can only edit offerings on your own pages',
      );
    }
    return this.prisma.offering.update({
      where: { id: offering.id },
      data: {
        title: input.title?.trim(),
        kind: input.kind?.trim(),
        description:
          input.description === undefined
            ? undefined
            : input.description.trim() || null,
        // -1 is the "clear the price" sentinel.
        priceFrom:
          input.priceFrom === undefined
            ? undefined
            : input.priceFrom < 0
              ? null
              : input.priceFrom,
        images: input.imageUrls
          ? {
              deleteMany: {},
              create: input.imageUrls.map((url, order) => ({
                url: url.trim(),
                order,
              })),
            }
          : undefined,
      },
      include: offeringInclude,
    });
  }

  /** Delete an offering — only the owner of its page may. */
  async delete(authorId: string, offeringId: string): Promise<boolean> {
    const offering = await this.prisma.offering.findUnique({
      where: { id: offeringId },
      include: { page: true },
    });
    if (!offering) {
      throw new NotFoundException('Offering not found');
    }
    if (offering.page.ownerId !== authorId) {
      throw new ForbiddenException(
        'You can only delete offerings on your own pages',
      );
    }
    await this.prisma.offering.delete({ where: { id: offeringId } });
    return true;
  }

  /** A single page's offerings, newest first. */
  listByPageId(pageId: string) {
    return this.prisma.offering.findMany({
      where: { pageId },
      include: offeringInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Browse offerings across all pages, newest first, optionally by kind. */
  list(kind?: string | null, limit = 50) {
    return this.prisma.offering.findMany({
      where: kind ? { kind } : undefined,
      include: offeringInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
