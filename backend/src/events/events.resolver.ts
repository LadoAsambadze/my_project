import { UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { RsvpStatus } from '@prisma/client';
import { Event } from './models/event.model';
import { User } from '../users/models/user.model';
import { EventsService } from './events.service';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => Event)
@UseGuards(GqlAuthGuard)
export class EventsResolver {
  constructor(private readonly events: EventsService) {}

  @Query(() => Event, { description: 'A single event by id.' })
  event(@Args('id', { type: () => ID }) id: string) {
    return this.events.findById(id);
  }

  @Query(() => [Event], { description: "A user's events, soonest first." })
  userEvents(@Args('username') username: string) {
    return this.events.listByUsername(username.toLowerCase());
  }

  @Query(() => [Event], { description: "A page's events, soonest first." })
  pageEvents(@Args('pageId', { type: () => ID }) pageId: string) {
    return this.events.listByPageId(pageId);
  }

  @Query(() => [Event], {
    description: "Global events feed: everyone's events, newest first.",
  })
  eventsFeed() {
    return this.events.feed();
  }

  @Mutation(() => Event, { description: 'Create an event.' })
  createEvent(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: CreateEventInput,
  ) {
    return this.events.create(current.userId, input);
  }

  @Mutation(() => Event, { description: 'Edit one of your own events.' })
  updateEvent(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: UpdateEventInput,
  ) {
    return this.events.update(current.userId, input);
  }

  @Mutation(() => Boolean, { description: 'Delete one of your own events.' })
  deleteEvent(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.events.delete(current.userId, id);
  }

  @Mutation(() => Event, {
    description:
      'Set your RSVP on an event: GOING or INTERESTED; omit status to withdraw.',
  })
  rsvpEvent(
    @CurrentUser() current: AuthenticatedUser,
    @Args('eventId', { type: () => ID }) eventId: string,
    @Args('status', { type: () => RsvpStatus, nullable: true })
    status?: RsvpStatus | null,
  ) {
    return this.events.rsvp(current.userId, eventId, status ?? null);
  }

  @ResolveField(() => Int)
  goingCount(@Parent() event: Event): Promise<number> {
    return this.events.countRsvps(event.id, RsvpStatus.GOING);
  }

  @ResolveField(() => Int)
  interestedCount(@Parent() event: Event): Promise<number> {
    return this.events.countRsvps(event.id, RsvpStatus.INTERESTED);
  }

  @ResolveField(() => RsvpStatus, { nullable: true })
  myRsvp(
    @Parent() event: Event,
    @CurrentUser() current: AuthenticatedUser | undefined,
  ): Promise<RsvpStatus | null> {
    if (!current) {
      return Promise.resolve(null);
    }
    return this.events.myRsvp(current.userId, event.id);
  }

  @ResolveField(() => [User])
  attendees(@Parent() event: Event) {
    return this.events.attendees(event.id);
  }
}
