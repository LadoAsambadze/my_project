import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Event } from './models/event.model';
import { EventsService } from './events.service';
import { CreateEventInput } from './dto/create-event.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => Event)
@UseGuards(GqlAuthGuard)
export class EventsResolver {
  constructor(private readonly events: EventsService) {}

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

  @Mutation(() => Boolean, { description: 'Delete one of your own events.' })
  deleteEvent(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.events.delete(current.userId, id);
  }
}
