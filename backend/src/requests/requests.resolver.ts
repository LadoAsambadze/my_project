import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PageType } from '@prisma/client';
import { Request } from './models/request.model';
import { RequestsService } from './requests.service';
import { CreateRequestInput } from './dto/create-request.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => Request)
@UseGuards(GqlAuthGuard)
export class RequestsResolver {
  constructor(private readonly requestsService: RequestsService) {}

  @Query(() => [Request], {
    description:
      'Browse demand requests, newest first, optionally filtered by vendor category.',
  })
  requests(
    @Args('category', { type: () => PageType, nullable: true })
    category?: PageType | null,
  ) {
    return this.requestsService.list(category);
  }

  @Query(() => [Request], {
    description:
      "Requests matching the categories of the viewer's pages — the vendor inbox.",
  })
  requestsForMyPages(@CurrentUser() current: AuthenticatedUser) {
    return this.requestsService.listForMyPages(current.userId);
  }

  @Mutation(() => Request, {
    description: 'Post a demand request ("I need a photographer for ...").',
  })
  createRequest(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: CreateRequestInput,
  ) {
    return this.requestsService.create(current.userId, input);
  }

  @Mutation(() => Boolean, { description: 'Delete one of your own requests.' })
  deleteRequest(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.requestsService.delete(current.userId, id);
  }
}
