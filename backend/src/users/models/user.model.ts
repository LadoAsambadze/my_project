import {
  ObjectType,
  Field,
  ID,
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
}
