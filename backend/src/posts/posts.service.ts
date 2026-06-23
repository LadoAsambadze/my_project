import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostInput } from './dto/create-post.input';

// Every post we return carries its author (for the header) and its media,
// oldest-attached first (so a gallery reads left-to-right in upload order).
const postInclude = {
  author: true,
  media: { orderBy: { createdAt: 'asc' } },
} as const;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a post for `authorId`. Requires text or at least one media item. */
  create(authorId: string, input: CreatePostInput) {
    const body = input.body?.trim() || null;
    const media = input.media ?? [];
    if (!body && media.length === 0) {
      throw new BadRequestException(
        'A post needs text or at least one photo or video',
      );
    }
    return this.prisma.post.create({
      data: {
        authorId,
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

  /** A single user's posts, newest first. */
  listByAuthorId(authorId: string) {
    return this.prisma.post.findMany({
      where: { authorId },
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

  /** Global news feed: everyone's posts, newest first. */
  feed(limit = 50) {
    return this.prisma.post.findMany({
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
