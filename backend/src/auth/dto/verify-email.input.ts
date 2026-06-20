import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

@InputType()
export class VerifyEmailInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @Length(6, 6, { message: 'The code must be 6 digits' })
  @Matches(/^\d{6}$/, { message: 'The code must be 6 digits' })
  code: string;
}
