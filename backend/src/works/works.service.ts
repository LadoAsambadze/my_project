import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PagesService } from '../pages/pages.service';
import { CreateWorkInput } from './dto/create-work.input';
import { UpdateWorkInput } from './dto/update-work.input';

// Every work we return carries its page (for the "by <page>" line) and its
// media in upload order.
const workInclude = {
  page: { include: { owner: true } },
  media: { orderBy: { order: 'asc' } },
} as const;

@Injectable()
export class WorksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pages: PagesService,
  ) {}

  /**
   * Publish a work under one of `authorId`'s pages. The page must be a
   * PHOTOGRAPHER ("Photo & Video") page — other vendor types have their own
   * flows.
   */
  async create(authorId: string, input: CreateWorkInput) {
    const page = await this.pages.assertOwned(authorId, input.pageId);
    if (!page.types.includes(PageType.PHOTOGRAPHER)) {
      throw new BadRequestException(
        'Only photo & video pages can publish works',
      );
    }
    return this.prisma.work.create({
      data: {
        pageId: page.id,
        title: input.title.trim(),
        category: input.category.trim(),
        description: input.description?.trim() || null,
        priceFrom: input.priceFrom ?? null,
        media: {
          create: input.media.map((m, order) => ({
            url: m.url.trim(),
            type: m.type,
            order,
          })),
        },
      },
      include: workInclude,
    });
  }

  /** Update a work — only the owner of its page may. */
  async update(authorId: string, input: UpdateWorkInput) {
    const work = await this.prisma.work.findUnique({
      where: { id: input.workId },
      include: { page: true },
    });
    if (!work) {
      throw new NotFoundException('Work not found');
    }
    if (work.page.ownerId !== authorId) {
      throw new ForbiddenException('You can only edit works on your own pages');
    }
    return this.prisma.work.update({
      where: { id: work.id },
      data: {
        title: input.title?.trim(),
        category: input.category?.trim(),
        description:
          input.description === undefined
            ? undefined
            : input.description.trim() || null,
        // -1 is the "clear the price" sentinel (null can't be distinguished
        // from "not provided" in the GraphQL input).
        priceFrom:
          input.priceFrom === undefined
            ? undefined
            : input.priceFrom < 0
              ? null
              : input.priceFrom,
        media: input.media
          ? {
              deleteMany: {},
              create: input.media.map((m, order) => ({
                url: m.url.trim(),
                type: m.type,
                order,
              })),
            }
          : undefined,
      },
      include: workInclude,
    });
  }

  /** Delete a work — only the owner of its page may. */
  async delete(authorId: string, workId: string): Promise<boolean> {
    const work = await this.prisma.work.findUnique({
      where: { id: workId },
      include: { page: true },
    });
    if (!work) {
      throw new NotFoundException('Work not found');
    }
    if (work.page.ownerId !== authorId) {
      throw new ForbiddenException(
        'You can only delete works on your own pages',
      );
    }
    await this.prisma.work.delete({ where: { id: workId } });
    return true;
  }

  /** A single page's works, newest first. */
  listByPageId(pageId: string) {
    return this.prisma.work.findMany({
      where: { pageId },
      include: workInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Browse works across all pages, newest first, optionally by category. */
  list(category?: string | null, limit = 50) {
    return this.prisma.work.findMany({
      where: category ? { category } : undefined,
      include: workInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
