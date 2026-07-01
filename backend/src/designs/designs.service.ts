import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PagesService } from '../pages/pages.service';
import { CreateDesignInput } from './dto/create-design.input';

// Every design we return carries its page (for the "by <page>" line in the
// browse grid) and its photos in upload order.
const designInclude = {
  page: { include: { owner: true } },
  images: { orderBy: { order: 'asc' } },
} as const;

@Injectable()
export class DesignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pages: PagesService,
  ) {}

  /**
   * Publish a design under one of `authorId`'s pages. The page must be a
   * DESIGNER page — other vendor types show their work through posts instead.
   */
  async create(authorId: string, input: CreateDesignInput) {
    const page = await this.pages.assertOwned(authorId, input.pageId);
    if (!page.types.includes(PageType.DESIGNER)) {
      throw new BadRequestException(
        'Only designer pages can publish designs',
      );
    }
    return this.prisma.design.create({
      data: {
        pageId: page.id,
        title: input.title.trim(),
        occasion: input.occasion.trim(),
        description: input.description?.trim() || null,
        priceFrom: input.priceFrom ?? null,
        images: {
          create: input.imageUrls.map((url, order) => ({
            url: url.trim(),
            order,
          })),
        },
      },
      include: designInclude,
    });
  }

  /** Delete a design — only the owner of its page may. */
  async delete(authorId: string, designId: string): Promise<boolean> {
    const design = await this.prisma.design.findUnique({
      where: { id: designId },
      include: { page: true },
    });
    if (!design) {
      throw new NotFoundException('Design not found');
    }
    if (design.page.ownerId !== authorId) {
      throw new ForbiddenException(
        'You can only delete designs on your own pages',
      );
    }
    await this.prisma.design.delete({ where: { id: designId } });
    return true;
  }

  /** A single page's designs, newest first. */
  listByPageId(pageId: string) {
    return this.prisma.design.findMany({
      where: { pageId },
      include: designInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Browse designs across all pages, newest first, optionally by occasion. */
  list(occasion?: string | null, limit = 50) {
    return this.prisma.design.findMany({
      where: occasion ? { occasion } : undefined,
      include: designInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
