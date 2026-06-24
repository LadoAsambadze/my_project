import {
  ObjectType,
  Field,
  ID,
  Int,
  registerEnumType,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { PageType } from '@prisma/client';
import { User } from '../../users/models/user.model';

registerEnumType(PageType, { name: 'PageType' });

@ObjectType()
export class Page {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Display name of the page.' })
  name: string;

  @Field(() => PageType, { description: 'Thematic category of the page.' })
  type: PageType;

  @Field(() => String, {
    nullable: true,
    description: 'URL of the page photo, served from /uploads.',
  })
  photoUrl?: string | null;

  @Field(() => User, { description: 'The user who created and owns the page.' })
  owner: User;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Computed by field resolvers — not on the Prisma object, so optional in TS;
  // still non-null in the GraphQL schema via @Field.
  @Field(() => Int, { description: 'Number of posts published by this page.' })
  postsCount?: number;

  @Field(() => Int, { description: 'Number of users following this page.' })
  followersCount?: number;

  @Field({
    description:
      'Whether the signed-in viewer follows this page (false when signed out).',
  })
  isFollowedByMe?: boolean;
}
