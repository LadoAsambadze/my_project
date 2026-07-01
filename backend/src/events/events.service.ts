import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventType, RsvpStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PagesService } from '../pages/pages.service';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';

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

  /** A single event by id, or throws. */
  async findById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: eventInclude,
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  /** Update an event — only the author may. */
  async update(authorId: string, input: UpdateEventInput) {
    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own events');
    }
    return this.prisma.event.update({
      where: { id: event.id },
      data: {
        title: input.title?.trim(),
        type: input.type,
        subtype:
          input.subtype === undefined
            ? undefined
            : input.subtype.trim() || null,
        startsAt: input.startsAt,
        location:
          input.location === undefined
            ? undefined
            : input.location.trim() || null,
        description:
          input.description === undefined
            ? undefined
            : input.description.trim() || null,
        coverUrl:
          input.coverUrl === undefined
            ? undefined
            : input.coverUrl.trim() || null,
      },
      include: eventInclude,
    });
  }

  // ---------------------------------------------------------------------------
  // RSVP (going / interested)
  // ---------------------------------------------------------------------------

  /**
   * Set the viewer's RSVP on an event: GOING or INTERESTED upserts the row,
   * null withdraws it. Returns the event so the client cache updates.
   */
  async rsvp(userId: string, eventId: string, status: RsvpStatus | null) {
    const event = await this.findById(eventId);
    if (status === null) {
      await this.prisma.eventRsvp.deleteMany({ where: { userId, eventId } });
    } else {
      await this.prisma.eventRsvp.upsert({
        where: { userId_eventId: { userId, eventId } },
        create: { userId, eventId, status },
        update: { status },
      });
    }
    return event;
  }

  countRsvps(eventId: string, status: RsvpStatus): Promise<number> {
    return this.prisma.eventRsvp.count({ where: { eventId, status } });
  }

  async myRsvp(userId: string, eventId: string): Promise<RsvpStatus | null> {
    const row = await this.prisma.eventRsvp.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    return row?.status ?? null;
  }

  /** A few going users, newest RSVP first — drives the avatar row. */
  async attendees(eventId: string, limit = 6) {
    const rows = await this.prisma.eventRsvp.findMany({
      where: { eventId, status: RsvpStatus.GOING },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((r) => r.user);
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
