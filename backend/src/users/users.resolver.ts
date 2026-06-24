import {
  ConflictException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
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
import { Prisma } from '@prisma/client';
import { User } from './models/user.model';
import { Page } from '../pages/models/page.model';
import { UsersService } from './users.service';
import { PagesService } from '../pages/pages.service';
import { UpdateProfileInput } from './dto/update-profile.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly users: UsersService,
    private readonly pagesService: PagesService,
  ) {}

  @Query(() => User, { description: 'Fetch a user by their @username.' })
  @UseGuards(GqlAuthGuard)
  async user(@Args('username') username: string): Promise<User> {
    const user = await this.users.findByUsername(username.toLowerCase());
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Query(() => [User], {
    description: 'Search users by @username or name (excludes the viewer).',
  })
  @UseGuards(GqlAuthGuard)
  searchUsers(
    @CurrentUser() current: AuthenticatedUser,
    @Args('query') query: string,
  ): Promise<User[]> {
    return this.users.search(query, current.userId);
  }

  @Mutation(() => User, { description: 'Follow another user.' })
  @UseGuards(GqlAuthGuard)
  follow(
    @CurrentUser() current: AuthenticatedUser,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<User> {
    return this.users.follow(current.userId, userId);
  }

  @Mutation(() => User, { description: 'Unfollow a user.' })
  @UseGuards(GqlAuthGuard)
  unfollow(
    @CurrentUser() current: AuthenticatedUser,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<User> {
    return this.users.unfollow(current.userId, userId);
  }

  @ResolveField(() => Int)
  followersCount(@Parent() user: User): Promise<number> {
    return this.users.countFollowers(user.id);
  }

  @ResolveField(() => Int)
  followingCount(@Parent() user: User): Promise<number> {
    return this.users.countFollowing(user.id);
  }

  @ResolveField(() => [User], { description: 'Users who follow this user.' })
  followers(@Parent() user: User): Promise<User[]> {
    return this.users.listFollowers(user.id);
  }

  @ResolveField(() => [User], { description: 'Users this user follows.' })
  following(@Parent() user: User): Promise<User[]> {
    return this.users.listFollowing(user.id);
  }

  @ResolveField(() => Boolean)
  isFollowedByMe(
    @Parent() user: User,
    @CurrentUser() current: AuthenticatedUser | undefined,
  ): Promise<boolean> {
    if (!current || current.userId === user.id) {
      return Promise.resolve(false);
    }
    return this.users.isFollowing(current.userId, user.id);
  }

  @ResolveField(() => [Page], { description: 'Pages this user owns.' })
  pages(@Parent() user: User): Promise<Page[]> {
    return this.pagesService.listByOwner(user.id);
  }

  @Mutation(() => User, {
    description: "Update the signed-in user's profile.",
  })
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: UpdateProfileInput,
  ): Promise<User> {
    const data: Prisma.UserUpdateInput = {};

    // Only touch fields the client actually sent. An empty string clears the
    // field (stored as null); a trimmed non-empty string is saved.
    if (input.username !== undefined) {
      const username = input.username.trim().toLowerCase();
      if (username.length === 0) {
        data.username = null;
      } else {
        const taken = await this.users.findByUsername(username);
        if (taken && taken.id !== current.userId) {
          throw new ConflictException('This username is already taken');
        }
        data.username = username;
      }
    }
    if (input.firstName !== undefined)
      data.firstName = normalize(input.firstName);
    if (input.lastName !== undefined) data.lastName = normalize(input.lastName);
    if (input.birthDate !== undefined)
      data.birthDate = input.birthDate ? new Date(input.birthDate) : null;
    if (input.bio !== undefined) data.bio = normalize(input.bio);
    if (input.avatarUrl !== undefined)
      data.avatarUrl = normalize(input.avatarUrl);
    if (input.location !== undefined) data.location = normalize(input.location);

    return this.users.update(current.userId, data);
  }
}

function normalize(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
