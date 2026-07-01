import { Type, UseGuards } from '@nestjs/common';
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
import { Comment } from './models/comment.model';
import { CommentsService } from './comments.service';
import { CreateCommentInput } from './dto/create-comment.input';
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

@Resolver(() => Comment)
@UseGuards(GqlAuthGuard)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Query(() => [Comment], {
    description: 'All comments on a piece of content, oldest first.',
  })
  comments(
    @Args('target', { type: () => ContentTarget }) target: ContentTarget,
    @Args('targetId', { type: () => ID }) targetId: string,
  ) {
    return this.commentsService.list(target, targetId);
  }

  @Mutation(() => Comment, { description: 'Write a comment on content.' })
  addComment(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: CreateCommentInput,
  ) {
    return this.commentsService.create(current.userId, input);
  }

  @Mutation(() => Boolean, { description: 'Delete one of your own comments.' })
  deleteComment(
    @CurrentUser() current: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.commentsService.delete(current.userId, id);
  }
}

/**
 * Adds a `commentsCount` field resolver to a content type — one generated
 * class per (model, target) pair, mirroring the likes module.
 */
function createCommentFieldsResolver(
  classRef: Type<unknown>,
  target: ContentTarget,
  name: string,
): Type<unknown> {
  @Resolver(() => classRef)
  @UseGuards(GqlAuthGuard)
  class CommentFieldsResolver {
    constructor(public readonly comments: CommentsService) {}

    @ResolveField(() => Int, { name: 'commentsCount' })
    commentsCount(@Parent() parent: { id: string }): Promise<number> {
      return this.comments.count(target, parent.id);
    }
  }
  Object.defineProperty(CommentFieldsResolver, 'name', { value: name });
  return CommentFieldsResolver;
}

export const COMMENT_FIELD_RESOLVERS = [
  createCommentFieldsResolver(Post, ContentTarget.POST, 'PostCommentFieldsResolver'),
  createCommentFieldsResolver(Event, ContentTarget.EVENT, 'EventCommentFieldsResolver'),
  createCommentFieldsResolver(Design, ContentTarget.DESIGN, 'DesignCommentFieldsResolver'),
  createCommentFieldsResolver(CateringOffer, ContentTarget.CATERING_OFFER, 'CateringOfferCommentFieldsResolver'),
  createCommentFieldsResolver(Offering, ContentTarget.OFFERING, 'OfferingCommentFieldsResolver'),
  createCommentFieldsResolver(Work, ContentTarget.WORK, 'WorkCommentFieldsResolver'),
  createCommentFieldsResolver(FloristItem, ContentTarget.FLORIST_ITEM, 'FloristItemCommentFieldsResolver'),
  createCommentFieldsResolver(Request, ContentTarget.REQUEST, 'RequestCommentFieldsResolver'),
];
