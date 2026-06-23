import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { PostMedia } from './post-media.model';

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true, description: 'Optional text body.' })
  body?: string | null;

  @Field(() => User)
  author: User;

  @Field(() => [PostMedia], { description: 'Attached images and videos.' })
  media: PostMedia[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
