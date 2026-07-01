import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContentTarget,
  CONTENT_TARGET_FIELD,
} from '../common/content-target.enum';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Like a piece of content. Idempotent (a repeat like is a no-op). */
  async like(userId: string, target: ContentTarget, targetId: string) {
    const field = CONTENT_TARGET_FIELD[target];
    try {
      await this.prisma.like.create({
        data: { userId, [field]: targetId },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          return; // already liked — no-op
        }
        if (e.code === 'P2003') {
          throw new NotFoundException('Content not found');
        }
      }
      throw e;
    }
  }

  /** Unlike a piece of content. Idempotent. */
  async unlike(userId: string, target: ContentTarget, targetId: string) {
    const field = CONTENT_TARGET_FIELD[target];
    await this.prisma.like.deleteMany({
      where: { userId, [field]: targetId },
    });
  }

  /** How many likes a piece of content has. */
  count(target: ContentTarget, targetId: string): Promise<number> {
    const field = CONTENT_TARGET_FIELD[target];
    return this.prisma.like.count({ where: { [field]: targetId } });
  }

  /** Whether `userId` liked this content. */
  async likedBy(
    userId: string,
    target: ContentTarget,
    targetId: string,
  ): Promise<boolean> {
    const field = CONTENT_TARGET_FIELD[target];
    const row = await this.prisma.like.findFirst({
      where: { userId, [field]: targetId },
      select: { id: true },
    });
    return row !== null;
  }
}
