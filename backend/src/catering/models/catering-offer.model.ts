import {
  ObjectType,
  Field,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Page } from '../../pages/models/page.model';

@ObjectType()
export class CateringOfferImage {
  @Field(() => ID)
  id: string;

  @Field({ description: 'URL of the photo, served from /uploads.' })
  url: string;

  @Field(() => Int, { description: 'Position in the upload order.' })
  order: number;
}

/// A menu offer published by a CATERING page: one package it sells.
@ObjectType()
export class CateringOffer {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Title of the offer.' })
  title: string;

  @Field({
    description:
      'Kind label from the frontend catalog (e.g. "FURSHET"), mirroring Design.occasion.',
  })
  kind: string;

  @Field(() => String, {
    nullable: true,
    description: 'Optional longer description (what the menu includes).',
  })
  description?: string | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Optional per-guest price in GEL.',
  })
  pricePerPerson?: number | null;

  @Field(() => [CateringOfferImage], {
    description: 'Photos of the offer, in upload order.',
  })
  images: CateringOfferImage[];

  // Nullable in GraphQL (though always set) so it merges with Post.page
  // inside the FeedItem union selection.
  @Field(() => Page, {
    nullable: true,
    description: 'The catering page that published it.',
  })
  page: Page;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
