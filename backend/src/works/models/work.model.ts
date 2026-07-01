import {
  ObjectType,
  Field,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { MediaType } from '@prisma/client';
import { Page } from '../../pages/models/page.model';

@ObjectType()
export class WorkMedia {
  @Field(() => ID)
  id: string;

  @Field({ description: 'URL of the file, served from /uploads.' })
  url: string;

  @Field(() => MediaType, { description: 'Whether this is a photo or video.' })
  type: MediaType;

  @Field(() => Int, { description: 'Position in the upload order.' })
  order: number;
}

/// A portfolio work published by a Photo & Video page: one shoot/project.
@ObjectType()
export class Work {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Title of the work.' })
  title: string;

  @Field({
    description:
      'Category label from the frontend catalog (e.g. "WEDDING"), mirroring Design.occasion.',
  })
  category: string;

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

  @Field(() => [WorkMedia], {
    description: 'Photos and videos of the work, in upload order.',
  })
  media: WorkMedia[];

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
