import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Page } from '../../pages/models/page.model';
import { PostMedia } from './post-media.model';

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true, description: 'Optional text body.' })
  body?: string | null;

  @Field(() => User, { description: 'The user who created the post.' })
  author: User;

  @Field(() => Page, {
    nullable: true,
    description:
      'Set when the post was published as a page; null for personal posts.',
  })
  page?: Page | null;

  @Field(() => [PostMedia], { description: 'Attached images and videos.' })
  media: PostMedia[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
