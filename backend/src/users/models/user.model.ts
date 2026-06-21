import {
  ObjectType,
  Field,
  ID,
  Int,
  registerEnumType,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Role } from '@prisma/client';

registerEnumType(Role, { name: 'Role' });

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  username?: string | null;

  @Field(() => Role)
  role: Role;

  @Field()
  isVerified: boolean;

  @Field()
  isActive: boolean;

  @Field(() => String, { nullable: true })
  firstName?: string | null;

  @Field(() => String, { nullable: true })
  lastName?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  birthDate?: Date | null;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => String, { nullable: true })
  location?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Computed by field resolvers in UsersResolver — not present on the Prisma
  // object, so optional in TS; still non-null in the GraphQL schema via @Field.
  @Field(() => Int, { description: 'Number of users following this user.' })
  followersCount?: number;

  @Field(() => Int, { description: 'Number of users this user follows.' })
  followingCount?: number;

  @Field({
    description: 'Whether the signed-in viewer follows this user (false for self).',
  })
  isFollowedByMe?: boolean;
}
