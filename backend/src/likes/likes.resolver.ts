import { Type, UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  ID,
  Int,
  Mutation,
  ObjectType,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { LikesService } from './likes.service';
import { ContentTarget } from '../common/content-target.enum';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt-access.strategy';
import { Post } from '../posts/models/post.model';
import { Event } from '../events/models/event.model';
import { Design } from '../designs/models/design.model';
import { CateringOffer } from '../catering/models/catering-offer.model';
import { Offering } from '../offerings/models/offering.model';
import { Work } from '../works/models/work.model';
import { FloristItem } from '../florist/models/florist-item.model';
import { Request } from '../requests/models/request.model';

/// Returned by like/unlike so the client can update its UI without refetching
/// the whole item.
@ObjectType()
export class LikeResult {
  @Field(() => ID, { description: 'The content that was (un)liked.' })
  targetId: string;

  @Field(() => Int)
  likesCount: number;

  @Field()
  likedByMe: boolean;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class LikesResolver {
  constructor(private readonly likes: LikesService) {}

  @Mutation(() => LikeResult, { description: 'Like a piece of content.' })
  async like(
    @CurrentUser() current: AuthenticatedUser,
    @Args('target', { type: () => ContentTarget }) target: ContentTarget,
    @Args('targetId', { type: () => ID }) targetId: string,
  ): Promise<LikeResult> {
    await this.likes.like(current.userId, target, targetId);
    return {
      targetId,
      likesCount: await this.likes.count(target, targetId),
      likedByMe: true,
    };
  }

  @Mutation(() => LikeResult, { description: 'Remove your like from content.' })
  async unlike(
    @CurrentUser() current: AuthenticatedUser,
    @Args('target', { type: () => ContentTarget }) target: ContentTarget,
    @Args('targetId', { type: () => ID }) targetId: string,
  ): Promise<LikeResult> {
    await this.likes.unlike(current.userId, target, targetId);
    return {
      targetId,
      likesCount: await this.likes.count(target, targetId),
      likedByMe: false,
    };
  }
}

/**
 * Adds `likesCount` and `likedByMe` field resolvers to a content type. One
 * generated resolver class per (model, target) pair — same behavior everywhere
 * without eight hand-written copies.
 */
function createLikeFieldsResolver(
  classRef: Type<unknown>,
  target: ContentTarget,
  name: string,
): Type<unknown> {
  @Resolver(() => classRef)
  @UseGuards(GqlAuthGuard)
  class LikeFieldsResolver {
    constructor(public readonly likes: LikesService) {}

    @ResolveField(() => Int, { name: 'likesCount' })
    likesCount(@Parent() parent: { id: string }): Promise<number> {
      return this.likes.count(target, parent.id);
    }

    @ResolveField(() => Boolean, { name: 'likedByMe' })
    likedByMe(
      @Parent() parent: { id: string },
      @CurrentUser() current: AuthenticatedUser | undefined,
    ): Promise<boolean> {
      if (!current) {
        return Promise.resolve(false);
      }
      return this.likes.likedBy(current.userId, target, parent.id);
    }
  }
  Object.defineProperty(LikeFieldsResolver, 'name', { value: name });
  return LikeFieldsResolver;
}

export const LIKE_FIELD_RESOLVERS = [
  createLikeFieldsResolver(Post, ContentTarget.POST, 'PostLikeFieldsResolver'),
  createLikeFieldsResolver(Event, ContentTarget.EVENT, 'EventLikeFieldsResolver'),
  createLikeFieldsResolver(Design, ContentTarget.DESIGN, 'DesignLikeFieldsResolver'),
  createLikeFieldsResolver(CateringOffer, ContentTarget.CATERING_OFFER, 'CateringOfferLikeFieldsResolver'),
  createLikeFieldsResolver(Offering, ContentTarget.OFFERING, 'OfferingLikeFieldsResolver'),
  createLikeFieldsResolver(Work, ContentTarget.WORK, 'WorkLikeFieldsResolver'),
  createLikeFieldsResolver(FloristItem, ContentTarget.FLORIST_ITEM, 'FloristItemLikeFieldsResolver'),
  createLikeFieldsResolver(Request, ContentTarget.REQUEST, 'RequestLikeFieldsResolver'),
];
