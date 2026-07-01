import {
  ObjectType,
  Field,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Page } from '../../pages/models/page.model';

@ObjectType()
export class OfferingImage {
  @Field(() => ID)
  id: string;

  @Field({ description: 'URL of the photo, served from /uploads.' })
  url: string;

  @Field(() => Int, { description: 'Position in the upload order.' })
  order: number;
}

/// A bookable service published by a MUSIC_SOUND page: an act (saxophone
/// player, DJ set) or a rental listing (sound system, lighting).
@ObjectType()
export class Offering {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Title of the offering.' })
  title: string;

  @Field({
    description:
      'Kind label from the frontend catalog (e.g. "SAXOPHONE", "SOUND_SYSTEM").',
  })
  kind: string;

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

  @Field(() => [OfferingImage], {
    description: 'Photos of the offering, in upload order.',
  })
  images: OfferingImage[];

  // Nullable in GraphQL (though always set) so it merges with Post.page
  // inside the FeedItem union selection.
  @Field(() => Page, {
    nullable: true,
    description: 'The page that published it.',
  })
  page: Page;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
