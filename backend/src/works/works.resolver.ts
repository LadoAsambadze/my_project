import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Work } from './models/work.model';
import { WorksService } from './works.service';
import { CreateWorkInput } from './dto/create-work.input';
import { UpdateWorkInput } from './dto/update-work.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => Work)
@UseGuards(GqlAuthGuard)
export class WorksResolver {
  constructor(private readonly worksService: WorksService) {}

  @Query(() => [Work], { description: "A page's portfolio works, newest first." })
  pageWorks(@Args('pageId', { type: () => ID }) pageId: string) {
    return this.worksService.listByPageId(pageId);
  }

  @Query(() => [Work], {
    description:
      'Browse works across all photo & video pages, newest first, optionally filtered by category.',
  })
  works(
    @Args('category', { type: () => String, nullable: true })
    category?: string | null,
  ) {
    return this.worksService.list(category);
  }

  @Mutation(() => Work, {
    description: 'Publish a portfolio work under one of your photo & video pages.',
  })
  createWork(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: CreateWorkInput,
  ) {
    return this.worksService.create(current.userId, input);
  }

  @Mutation(() => Work, { description: 'Edit one of your works.' })
  updateWork(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: UpdateWorkInput,
  ) {
    return this.worksService.update(current.userId, input);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a work from one of your own pages.',
  })
  deleteWork(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.worksService.delete(current.userId, id);
  }
}
