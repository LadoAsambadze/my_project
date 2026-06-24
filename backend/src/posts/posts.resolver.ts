import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Post } from './models/post.model';
import { PostsService } from './posts.service';
import { CreatePostInput } from './dto/create-post.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => Post)
@UseGuards(GqlAuthGuard)
export class PostsResolver {
  constructor(private readonly posts: PostsService) {}

  @Query(() => [Post], {
    description: "Global news feed: everyone's posts, newest first.",
  })
  feed() {
    return this.posts.feed();
  }

  @Query(() => [Post], { description: "A user's posts, newest first." })
  userPosts(@Args('username') username: string) {
    return this.posts.listByUsername(username.toLowerCase());
  }

  @Query(() => [Post], { description: "A page's posts, newest first." })
  pagePosts(@Args('pageId', { type: () => ID }) pageId: string) {
    return this.posts.listByPageId(pageId);
  }

  @Mutation(() => Post, {
    description: 'Create a post with text and/or uploaded media.',
  })
  createPost(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: CreatePostInput,
  ) {
    return this.posts.create(current.userId, input);
  }

  @Mutation(() => Boolean, { description: 'Delete one of your own posts.' })
  deletePost(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.posts.delete(current.userId, id);
  }
}
