import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Offering } from './models/offering.model';
import { OfferingsService } from './offerings.service';
import { CreateOfferingInput } from './dto/create-offering.input';
import { UpdateOfferingInput } from './dto/update-offering.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';

@Resolver(() => Offering)
@UseGuards(GqlAuthGuard)
export class OfferingsResolver {
  constructor(private readonly offeringsService: OfferingsService) {}

  @Query(() => [Offering], {
    description: "A page's offerings, newest first.",
  })
  pageOfferings(@Args('pageId', { type: () => ID }) pageId: string) {
    return this.offeringsService.listByPageId(pageId);
  }

  @Query(() => [Offering], {
    description:
      'Browse offerings across all musician/equipment pages, newest first, optionally filtered by kind.',
  })
  offerings(
    @Args('kind', { type: () => String, nullable: true })
    kind?: string | null,
  ) {
    return this.offeringsService.list(kind);
  }

  @Mutation(() => Offering, {
    description:
      'Publish an offering under one of your musician or equipment pages.',
  })
  createOffering(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: CreateOfferingInput,
  ) {
    return this.offeringsService.create(current.userId, input);
  }

  @Mutation(() => Offering, { description: 'Edit one of your offerings.' })
  updateOffering(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: UpdateOfferingInput,
  ) {
    return this.offeringsService.update(current.userId, input);
  }

  @Mutation(() => Boolean, {
    description: 'Delete an offering from one of your own pages.',
  })
  deleteOffering(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.offeringsService.delete(current.userId, id);
  }
}
