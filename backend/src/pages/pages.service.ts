import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Page, PageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageInput } from './dto/create-page.input';

// Every page we return carries its owner (for the "created by" line).
const pageInclude = { owner: true } as const;

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a page owned by `ownerId`. Type defaults to PHOTOGRAPHER. */
  create(ownerId: string, input: CreatePageInput) {
    return this.prisma.page.create({
      data: {
        ownerId,
        name: input.name.trim(),
        type: input.type ?? PageType.PHOTOGRAPHER,
        photoUrl: input.photoUrl?.trim() || null,
      },
      include: pageInclude,
    });
  }

  /** A single page by id, or null if it doesn't exist. */
  findById(id: string) {
    return this.prisma.page.findUnique({
      where: { id },
      include: pageInclude,
    });
  }

  /** Pages owned by `ownerId`, newest first. */
  listByOwner(ownerId: string) {
    return this.prisma.page.findMany({
      where: { ownerId },
      include: pageInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Browse all pages, newest first. */
  list(limit = 50) {
    return this.prisma.page.findMany({
      include: pageInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /** How many posts a page has published. */
  countPosts(pageId: string): Promise<number> {
    return this.prisma.post.count({ where: { pageId } });
  }

  // ---------------------------------------------------------------------------
  // Follow graph (user -> page)
  // ---------------------------------------------------------------------------

  /** Follow a page. Idempotent (a repeat follow is a no-op). */
  async follow(followerId: string, pageId: string) {
    const page = await this.findById(pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    if (page.ownerId === followerId) {
      throw new BadRequestException('You cannot follow your own page');
    }
    await this.prisma.pageFollow.upsert({
      where: { followerId_pageId: { followerId, pageId } },
      create: { followerId, pageId },
      update: {},
    });
    return page;
  }

  /** Unfollow a page. Idempotent (no-op if not currently following). */
  async unfollow(followerId: string, pageId: string) {
    const page = await this.findById(pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    await this.prisma.pageFollow.deleteMany({ where: { followerId, pageId } });
    return page;
  }

  /** How many users follow a page. */
  countFollowers(pageId: string): Promise<number> {
    return this.prisma.pageFollow.count({ where: { pageId } });
  }

  /** Whether `followerId` currently follows `pageId`. */
  async isFollowedBy(followerId: string, pageId: string): Promise<boolean> {
    const row = await this.prisma.pageFollow.findUnique({
      where: { followerId_pageId: { followerId, pageId } },
    });
    return row !== null;
  }

  /** Delete a page — only its owner may. Cascades to the page's posts. */
  async delete(ownerId: string, pageId: string): Promise<boolean> {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    if (page.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own pages');
    }
    await this.prisma.page.delete({ where: { id: pageId } });
    return true;
  }

  /**
   * Assert that `pageId` exists and is owned by `ownerId`. Used before
   * publishing a post as a page. Returns the page on success.
   */
  async assertOwned(ownerId: string, pageId: string): Promise<Page> {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    if (page.ownerId !== ownerId) {
      throw new ForbiddenException('You can only post as your own pages');
    }
    return page;
  }
}
