import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class AuthPayload {
  @Field({ description: 'Short-lived JWT to send as `Authorization: Bearer`' })
  accessToken: string;

  @Field(() => User)
  user: User;
}
