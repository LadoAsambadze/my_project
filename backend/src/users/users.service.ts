import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  // ---------------------------------------------------------------------------
  // Follow graph
  // ---------------------------------------------------------------------------

  /** Follow another user. Idempotent (a repeat follow is a no-op). */
  async follow(followerId: string, followingId: string): Promise<User> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }
    const target = await this.findById(followingId);
    if (!target) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {},
    });
    return target;
  }

  /** Unfollow a user. Idempotent (no-op if not currently following). */
  async unfollow(followerId: string, followingId: string): Promise<User> {
    const target = await this.findById(followingId);
    if (!target) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    });
    return target;
  }

  /** How many users follow `userId`. */
  countFollowers(userId: string): Promise<number> {
    return this.prisma.follow.count({ where: { followingId: userId } });
  }

  /** How many users `userId` follows. */
  countFollowing(userId: string): Promise<number> {
    return this.prisma.follow.count({ where: { followerId: userId } });
  }

  /** Whether `followerId` currently follows `followingId`. */
  async isFollowing(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    const row = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return row !== null;
  }

  /** Users who follow `userId`, most recent first. */
  async listFollowers(userId: string): Promise<User[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => r.follower);
  }

  /** Users `userId` follows, most recent first. */
  async listFollowing(userId: string): Promise<User[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => r.following);
  }
}
