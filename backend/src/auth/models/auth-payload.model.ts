import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class AuthPayload {
  @Field({ description: 'Short-lived JWT to send as `Authorization: Bearer`' })
  accessToken: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Long-lived refresh token. Only returned to native clients (header `x-client-platform: native`); web clients receive it as an httpOnly cookie instead and this field is null.',
  })
  refreshToken?: string | null;

  @Field(() => User)
  user: User;
}
