import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PagesService } from '../pages/pages.service';
import { CreatePostInput } from './dto/create-post.input';

// Every post we return carries its author (for the header), its page (set when
// published as a page), and its media, oldest-attached first (so a gallery
// reads left-to-right in upload order).
const postInclude = {
  author: true,
  page: { include: { owner: true } },
  media: { orderBy: { createdAt: 'asc' } },
} as const;

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pages: PagesService,
  ) {}

  /**
   * Create a post for `authorId`. Requires text or at least one media item.
   * When `input.pageId` is set the post is published as that page — the author
   * must own it.
   */
  async create(authorId: string, input: CreatePostInput) {
    const body = input.body?.trim() || null;
    const media = input.media ?? [];
    if (!body && media.length === 0) {
      throw new BadRequestException(
        'A post needs text or at least one photo or video',
      );
    }
    // Normalize "" -> null so only a real page id publishes as a page.
    const pageId = input.pageId || null;
    if (pageId) {
      await this.pages.assertOwned(authorId, pageId);
    }
    return this.prisma.post.create({
      data: {
        authorId,
        pageId,
        body,
        media: media.length
          ? { create: media.map((m) => ({ url: m.url, type: m.type })) }
          : undefined,
      },
      include: postInclude,
    });
  }

  /** Delete a post — only the author may. */
  async delete(authorId: string, postId: string): Promise<boolean> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    await this.prisma.post.delete({ where: { id: postId } });
    return true;
  }

  /**
   * A single user's *personal* posts, newest first. Posts published as a page
   * (pageId set) are excluded — those belong to the page, not the profile.
   */
  listByAuthorId(authorId: string) {
    return this.prisma.post.findMany({
      where: { authorId, pageId: null },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async listByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.listByAuthorId(user.id);
  }

  /** A single page's posts, newest first. */
  listByPageId(pageId: string) {
    return this.prisma.post.findMany({
      where: { pageId },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Global news feed: everyone's posts, newest first. */
  feed(limit = 50) {
    return this.prisma.post.findMany({
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
