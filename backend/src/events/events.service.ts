import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PagesService } from '../pages/pages.service';
import { CreateEventInput } from './dto/create-event.input';

// Every event we return carries its author (for the host line) and its page
// (set when hosted as a page).
const eventInclude = {
  author: true,
  page: { include: { owner: true } },
} as const;

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pages: PagesService,
  ) {}

  /**
   * Create an event for `authorId`. When `input.pageId` is set the event is
   * hosted as that page — the author must own it.
   */
  async create(authorId: string, input: CreateEventInput) {
    // Normalize "" -> null so only a real page id hosts as a page.
    const pageId = input.pageId || null;
    if (pageId) {
      await this.pages.assertOwned(authorId, pageId);
    }
    return this.prisma.event.create({
      data: {
        authorId,
        pageId,
        title: input.title.trim(),
        type: input.type ?? EventType.OTHER,
        subtype: input.subtype?.trim() || null,
        description: input.description?.trim() || null,
        location: input.location?.trim() || null,
        coverUrl: input.coverUrl?.trim() || null,
        startsAt: input.startsAt,
      },
      include: eventInclude,
    });
  }

  /** Delete an event — only the author may. */
  async delete(authorId: string, eventId: string): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own events');
    }
    await this.prisma.event.delete({ where: { id: eventId } });
    return true;
  }

  /**
   * A single user's *personal* events, soonest first. Events hosted as a page
   * (pageId set) are excluded — those belong to the page, not the profile.
   */
  listByAuthorId(authorId: string) {
    return this.prisma.event.findMany({
      where: { authorId, pageId: null },
      include: eventInclude,
      orderBy: { startsAt: 'asc' },
    });
  }

  async listByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.listByAuthorId(user.id);
  }

  /** A single page's events, soonest first. */
  listByPageId(pageId: string) {
    return this.prisma.event.findMany({
      where: { pageId },
      include: eventInclude,
      orderBy: { startsAt: 'asc' },
    });
  }

  /** Global feed: everyone's events, newest created first (mirrors posts). */
  feed(limit = 50) {
    return this.prisma.event.findMany({
      include: eventInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
