import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver, GraphQLISODateTime } from '@nestjs/graphql';
import { FeedPage } from './models/feed-item.union';
import { FeedService } from './feed.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver()
@UseGuards(GqlAuthGuard)
export class FeedResolver {
  constructor(private readonly feedService: FeedService) {}

  @Query(() => FeedPage, {
    description:
      'Unified news feed: posts, events, and all vendor content, newest first, cursor-paginated.',
  })
  feedPage(
    @Args('cursor', { type: () => GraphQLISODateTime, nullable: true })
    cursor?: Date | null,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number | null,
  ) {
    return this.feedService.page(
      cursor ?? null,
      Math.min(Math.max(limit ?? 15, 1), 50),
    );
  }
}
