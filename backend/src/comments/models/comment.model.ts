import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

/// A comment on any content. The parent is implied by the query that fetched
/// it (comments(target, targetId)), so only author and body are exposed.
@ObjectType()
export class Comment {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Text of the comment.' })
  body: string;

  @Field(() => User, { description: 'The user who wrote the comment.' })
  author: User;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
