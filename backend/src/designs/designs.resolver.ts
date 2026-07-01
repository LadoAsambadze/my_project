import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Design } from './models/design.model';
import { DesignsService } from './designs.service';
import { CreateDesignInput } from './dto/create-design.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => Design)
@UseGuards(GqlAuthGuard)
export class DesignsResolver {
  constructor(private readonly designsService: DesignsService) {}

  @Query(() => [Design], { description: "A page's designs, newest first." })
  pageDesigns(@Args('pageId', { type: () => ID }) pageId: string) {
    return this.designsService.listByPageId(pageId);
  }

  @Query(() => [Design], {
    description:
      'Browse designs across all designer pages, newest first, optionally filtered by occasion.',
  })
  designs(
    @Args('occasion', { type: () => String, nullable: true })
    occasion?: string | null,
  ) {
    return this.designsService.list(occasion);
  }

  @Mutation(() => Design, {
    description: 'Publish a design under one of your designer pages.',
  })
  createDesign(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: CreateDesignInput,
  ) {
    return this.designsService.create(current.userId, input);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a design from one of your own pages.',
  })
  deleteDesign(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.designsService.delete(current.userId, id);
  }
}
