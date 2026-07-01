import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContentTarget,
  CONTENT_TARGET_FIELD,
} from '../common/content-target.enum';
import { CreateCommentInput } from './dto/create-comment.input';

// Every comment we return carries its author (for the header line).
const commentInclude = { author: true } as const;

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Write a comment on a piece of content. */
  async create(authorId: string, input: CreateCommentInput) {
    const field = CONTENT_TARGET_FIELD[input.target];
    try {
      return await this.prisma.comment.create({
        data: {
          authorId,
          body: input.body.trim(),
          [field]: input.targetId,
        },
        include: commentInclude,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new NotFoundException('Content not found');
      }
      throw e;
    }
  }

  /** Delete a comment — only its author may. */
  async delete(authorId: string, commentId: string): Promise<boolean> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.prisma.comment.delete({ where: { id: commentId } });
    return true;
  }

  /** All comments on a piece of content, oldest first (read top-down). */
  list(target: ContentTarget, targetId: string) {
    const field = CONTENT_TARGET_FIELD[target];
    return this.prisma.comment.findMany({
      where: { [field]: targetId },
      include: commentInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  /** How many comments a piece of content has. */
  count(target: ContentTarget, targetId: string): Promise<number> {
    const field = CONTENT_TARGET_FIELD[target];
    return this.prisma.comment.count({ where: { [field]: targetId } });
  }
}
