import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UpdateProfileInput } from './dto/update-profile.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly users: UsersService) {}

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
