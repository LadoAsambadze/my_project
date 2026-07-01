import { createUnionType, ObjectType, Field } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Post } from '../../posts/models/post.model';
import { Event } from '../../events/models/event.model';
import { Design } from '../../designs/models/design.model';
import { CateringOffer } from '../../catering/models/catering-offer.model';
import { Offering } from '../../offerings/models/offering.model';
import { Work } from '../../works/models/work.model';
import { FloristItem } from '../../florist/models/florist-item.model';
import { Request } from '../../requests/models/request.model';

/// Discriminator the feed service attaches to each row so the union can
/// resolve without guessing from the shape.
export type FeedTypeTag =
  | 'POST'
  | 'EVENT'
  | 'DESIGN'
  | 'CATERING_OFFER'
  | 'OFFERING'
  | 'WORK'
  | 'FLORIST_ITEM'
  | 'REQUEST';

export const FeedItem = createUnionType({
  name: 'FeedItem',
  description: 'Anything that can appear in the news feed.',
  types: () =>
    [
      Post,
      Event,
      Design,
      CateringOffer,
      Offering,
      Work,
      FloristItem,
      Request,
    ] as const,
  resolveType(value: { __feedType?: FeedTypeTag }) {
    switch (value.__feedType) {
      case 'POST':
        return Post;
      case 'EVENT':
        return Event;
      case 'DESIGN':
        return Design;
      case 'CATERING_OFFER':
        return CateringOffer;
      case 'OFFERING':
        return Offering;
      case 'WORK':
        return Work;
      case 'FLORIST_ITEM':
        return FloristItem;
      case 'REQUEST':
        return Request;
      default:
        return null;
    }
  },
});

/// One page of the news feed with the cursor for the next one.
@ObjectType()
export class FeedPage {
  @Field(() => [FeedItem], { description: 'Feed stories, newest first.' })
  items: Array<typeof FeedItem>;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description:
      'Pass as `cursor` to fetch the next page; null when this is the last page.',
  })
  nextCursor?: Date | null;

  @Field({ description: 'Whether more stories exist after this page.' })
  hasMore: boolean;
}
