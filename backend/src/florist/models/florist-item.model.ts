import {
  ObjectType,
  Field,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Page } from '../../pages/models/page.model';

@ObjectType()
export class FloristItemImage {
  @Field(() => ID)
  id: string;

  @Field({ description: 'URL of the photo, served from /uploads.' })
  url: string;

  @Field(() => Int, { description: 'Position in the upload order.' })
  order: number;
}

/// A catalog item published by a FLORIST page: one arrangement it sells.
@ObjectType()
export class FloristItem {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Title of the arrangement.' })
  title: string;

  @Field({
    description:
      'Kind label from the frontend catalog (e.g. "WEDDING_BOUQUET"), mirroring Design.occasion.',
  })
  kind: string;

  @Field(() => String, {
    nullable: true,
    description: 'Optional longer description.',
  })
  description?: string | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Optional starting price in GEL.',
  })
  priceFrom?: number | null;

  @Field(() => [FloristItemImage], {
    description: 'Photos of the arrangement, in upload order.',
  })
  images: FloristItemImage[];

  // Nullable in GraphQL (though always set) so it merges with Post.page
  // inside the FeedItem union selection.
  @Field(() => Page, {
    nullable: true,
    description: 'The florist page that published it.',
  })
  page: Page;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
