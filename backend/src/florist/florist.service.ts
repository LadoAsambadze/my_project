import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PagesService } from '../pages/pages.service';
import { CreateFloristItemInput } from './dto/create-florist-item.input';
import { UpdateFloristItemInput } from './dto/update-florist-item.input';

// Every item we return carries its page (for the "by <page>" line) and its
// photos in upload order.
const itemInclude = {
  page: { include: { owner: true } },
  images: { orderBy: { order: 'asc' } },
} as const;

@Injectable()
export class FloristService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pages: PagesService,
  ) {}

  /**
   * Publish an arrangement under one of `authorId`'s pages. The page must be
   * a FLORIST page — other vendor types have their own flows.
   */
  async create(authorId: string, input: CreateFloristItemInput) {
    const page = await this.pages.assertOwned(authorId, input.pageId);
    if (!page.types.includes(PageType.FLORIST)) {
      throw new BadRequestException(
        'Only florist pages can publish catalog items',
      );
    }
    return this.prisma.floristItem.create({
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
      include: itemInclude,
    });
  }

  /** Update an item — only the owner of its page may. */
  async update(authorId: string, input: UpdateFloristItemInput) {
    const item = await this.prisma.floristItem.findUnique({
      where: { id: input.itemId },
      include: { page: true },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    if (item.page.ownerId !== authorId) {
      throw new ForbiddenException('You can only edit items on your own pages');
    }
    return this.prisma.floristItem.update({
      where: { id: item.id },
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
      include: itemInclude,
    });
  }

  /** Delete an item — only the owner of its page may. */
  async delete(authorId: string, itemId: string): Promise<boolean> {
    const item = await this.prisma.floristItem.findUnique({
      where: { id: itemId },
      include: { page: true },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    if (item.page.ownerId !== authorId) {
      throw new ForbiddenException(
        'You can only delete items on your own pages',
      );
    }
    await this.prisma.floristItem.delete({ where: { id: itemId } });
    return true;
  }

  /** A single page's catalog items, newest first. */
  listByPageId(pageId: string) {
    return this.prisma.floristItem.findMany({
      where: { pageId },
      include: itemInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Browse items across all pages, newest first, optionally by kind. */
  list(kind?: string | null, limit = 50) {
    return this.prisma.floristItem.findMany({
      where: kind ? { kind } : undefined,
      include: itemInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
