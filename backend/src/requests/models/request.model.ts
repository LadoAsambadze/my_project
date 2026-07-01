import {
  ObjectType,
  Field,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { PageType } from '@prisma/client';
import { User } from '../../users/models/user.model';

/// A demand post: a user describes what they need for their event and vendor
/// pages of the matching category reply in the comments.
@ObjectType()
export class Request {
  @Field(() => ID)
  id: string;

  @Field(() => PageType, {
    description: 'Which vendor category this request targets.',
  })
  category: PageType;

  @Field(() => String, {
    nullable: true,
    description:
      'Occasion label from the frontend catalog (e.g. "WEDDING"), when given.',
  })
  occasion?: string | null;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'When the event takes place, when given.',
  })
  eventDate?: Date | null;

  @Field(() => String, { nullable: true, description: 'City, when given.' })
  city?: string | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Budget lower bound in GEL, when given.',
  })
  budgetFrom?: number | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Budget upper bound in GEL, when given.',
  })
  budgetTo?: number | null;

  // Nullable in GraphQL (though always set) so it merges with Post.body
  // inside the FeedItem union selection.
  @Field(() => String, {
    nullable: true,
    description: 'Free-text description of what is needed.',
  })
  body: string;

  @Field(() => User, { description: 'The user who posted the request.' })
  author: User;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
