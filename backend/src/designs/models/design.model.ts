import {
  ObjectType,
  Field,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Page } from '../../pages/models/page.model';

@ObjectType()
export class DesignImage {
  @Field(() => ID)
  id: string;

  @Field({ description: 'URL of the photo, served from /uploads.' })
  url: string;

  @Field(() => Int, { description: 'Position in the upload order.' })
  order: number;
}

/// A portfolio item published by a DESIGNER page: one decor setup it offers.
@ObjectType()
export class Design {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Title of the design.' })
  title: string;

  // Nullable in GraphQL (though always set) so it merges with
  // Request.occasion inside the FeedItem union selection.
  @Field(() => String, {
    nullable: true,
    description:
      'Occasion label from the frontend catalog (e.g. "WEDDING"), mirroring Event.subtype.',
  })
  occasion: string;

  @Field(() => String, {
    nullable: true,
    description: 'Optional longer description.',
  })
  description?: string | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Optional starting price in GEL (shown as "from X ₾").',
  })
  priceFrom?: number | null;

  @Field(() => [DesignImage], {
    description: 'Photos of the design, in upload order.',
  })
  images: DesignImage[];

  // Nullable in GraphQL (though always set) so it merges with Post.page
  // inside the FeedItem union selection.
  @Field(() => Page, {
    nullable: true,
    description: 'The designer page that published it.',
  })
  page: Page;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
