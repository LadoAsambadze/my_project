import {
  ObjectType,
  Field,
  ID,
  registerEnumType,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { MediaType } from '@prisma/client';

registerEnumType(MediaType, { name: 'MediaType' });

@ObjectType()
export class PostMedia {
  @Field(() => ID)
  id: string;

  @Field({ description: 'URL the uploaded file is served from.' })
  url: string;

  @Field(() => MediaType)
  type: MediaType;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
