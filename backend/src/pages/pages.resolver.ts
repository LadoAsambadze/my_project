import { NotFoundException, UseGuards } from '@nestjs/common';
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
import { Page } from './models/page.model';
import { PagesService } from './pages.service';
import { CreatePageInput } from './dto/create-page.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => Page)
@UseGuards(GqlAuthGuard)
export class PagesResolver {
  constructor(private readonly pagesService: PagesService) {}

  @Query(() => [Page], { description: 'Browse all pages, newest first.' })
  pages() {
    return this.pagesService.list();
  }

  @Query(() => [Page], {
    description: "The signed-in user's own pages, newest first.",
  })
  myPages(@CurrentUser() current: AuthenticatedUser) {
    return this.pagesService.listByOwner(current.userId);
  }

  @Query(() => Page, { description: 'Fetch a single page by id.' })
  async page(@Args('id', { type: () => ID }) id: string): Promise<Page> {
    const page = await this.pagesService.findById(id);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  @Mutation(() => Page, {
    description: 'Create a page with a name, type, and optional photo.',
  })
  createPage(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: CreatePageInput,
  ) {
    return this.pagesService.create(current.userId, input);
  }

  @Mutation(() => Boolean, { description: 'Delete one of your own pages.' })
  deletePage(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.pagesService.delete(current.userId, id);
  }

  @Mutation(() => Page, { description: 'Follow a page.' })
  followPage(
    @CurrentUser() current: AuthenticatedUser,
    @Args('pageId', { type: () => ID }) pageId: string,
  ): Promise<Page> {
    return this.pagesService.follow(current.userId, pageId);
  }

  @Mutation(() => Page, { description: 'Unfollow a page.' })
  unfollowPage(
    @CurrentUser() current: AuthenticatedUser,
    @Args('pageId', { type: () => ID }) pageId: string,
  ): Promise<Page> {
    return this.pagesService.unfollow(current.userId, pageId);
  }

  @ResolveField(() => Int)
  postsCount(@Parent() page: Page): Promise<number> {
    return this.pagesService.countPosts(page.id);
  }

  @ResolveField(() => Int)
  followersCount(@Parent() page: Page): Promise<number> {
    return this.pagesService.countFollowers(page.id);
  }

  @ResolveField(() => Boolean)
  isFollowedByMe(
    @Parent() page: Page,
    @CurrentUser() current: AuthenticatedUser | undefined,
  ): Promise<boolean> {
    if (!current) {
      return Promise.resolve(false);
    }
    return this.pagesService.isFollowedBy(current.userId, page.id);
  }
}
