import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @Length(6, 6, { message: 'The code must be 6 digits' })
  @Matches(/^\d{6}$/, { message: 'The code must be 6 digits' })
  code: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must be at most 72 characters' })
  newPassword: string;
}
