import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestInput } from './dto/create-request.input';

// Every request we return carries its author (for the header line).
const requestInclude = { author: true } as const;

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Post a demand request as `authorId`. */
  create(authorId: string, input: CreateRequestInput) {
    return this.prisma.request.create({
      data: {
        authorId,
        category: input.category,
        occasion: input.occasion?.trim() || null,
        eventDate: input.eventDate ?? null,
        city: input.city?.trim() || null,
        budgetFrom: input.budgetFrom ?? null,
        budgetTo: input.budgetTo ?? null,
        body: input.body.trim(),
      },
      include: requestInclude,
    });
  }

  /** Delete a request — only its author may. */
  async delete(authorId: string, requestId: string): Promise<boolean> {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    if (request.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own requests');
    }
    await this.prisma.request.delete({ where: { id: requestId } });
    return true;
  }

  /** Browse requests, newest first, optionally by vendor category. */
  list(category?: PageType | null, limit = 50) {
    return this.prisma.request.findMany({
      where: category ? { category } : undefined,
      include: requestInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Requests matching the vendor categories of `userId`'s pages — the
   * vendor-side "requests for me" view. Empty if the user owns no pages.
   */
  async listForMyPages(userId: string, limit = 50) {
    const pages = await this.prisma.page.findMany({
      where: { ownerId: userId },
      select: { types: true },
    });
    const categories = [...new Set(pages.flatMap((p) => p.types))];
    if (categories.length === 0) {
      return [];
    }
    return this.prisma.request.findMany({
      where: { category: { in: categories } },
      include: requestInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
