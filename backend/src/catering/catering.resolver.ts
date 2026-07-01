import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CateringOffer } from './models/catering-offer.model';
import { CateringService } from './catering.service';
import { CreateCateringOfferInput } from './dto/create-catering-offer.input';
import { UpdateCateringOfferInput } from './dto/update-catering-offer.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => CateringOffer)
@UseGuards(GqlAuthGuard)
export class CateringResolver {
  constructor(private readonly cateringService: CateringService) {}

  @Query(() => [CateringOffer], {
    description: "A page's menu offers, newest first.",
  })
  pageCateringOffers(@Args('pageId', { type: () => ID }) pageId: string) {
    return this.cateringService.listByPageId(pageId);
  }

  @Query(() => [CateringOffer], {
    description:
      'Browse menu offers across all catering pages, newest first, optionally filtered by kind.',
  })
  cateringOffers(
    @Args('kind', { type: () => String, nullable: true })
    kind?: string | null,
  ) {
    return this.cateringService.list(kind);
  }

  @Mutation(() => CateringOffer, {
    description: 'Publish a menu offer under one of your catering pages.',
  })
  createCateringOffer(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: CreateCateringOfferInput,
  ) {
    return this.cateringService.create(current.userId, input);
  }

  @Mutation(() => CateringOffer, { description: 'Edit one of your menu offers.' })
  updateCateringOffer(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: UpdateCateringOfferInput,
  ) {
    return this.cateringService.update(current.userId, input);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a menu offer from one of your own pages.',
  })
  deleteCateringOffer(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.cateringService.delete(current.userId, id);
  }
}
