import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FloristItem } from './models/florist-item.model';
import { FloristService } from './florist.service';
import { CreateFloristItemInput } from './dto/create-florist-item.input';
import { UpdateFloristItemInput } from './dto/update-florist-item.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => FloristItem)
@UseGuards(GqlAuthGuard)
export class FloristResolver {
  constructor(private readonly floristService: FloristService) {}

  @Query(() => [FloristItem], {
    description: "A page's catalog items, newest first.",
  })
  pageFloristItems(@Args('pageId', { type: () => ID }) pageId: string) {
    return this.floristService.listByPageId(pageId);
  }

  @Query(() => [FloristItem], {
    description:
      'Browse arrangements across all florist pages, newest first, optionally filtered by kind.',
  })
  floristItems(
    @Args('kind', { type: () => String, nullable: true })
    kind?: string | null,
  ) {
    return this.floristService.list(kind);
  }

  @Mutation(() => FloristItem, {
    description: 'Publish an arrangement under one of your florist pages.',
  })
  createFloristItem(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: CreateFloristItemInput,
  ) {
    return this.floristService.create(current.userId, input);
  }

  @Mutation(() => FloristItem, { description: 'Edit one of your catalog items.' })
  updateFloristItem(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: UpdateFloristItemInput,
  ) {
    return this.floristService.update(current.userId, input);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a catalog item from one of your own pages.',
  })
  deleteFloristItem(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.floristService.delete(current.userId, id);
  }
}
