import { InputType, Field } from '@nestjs/graphql';
import {
  IsDateString,
  IsEmail,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must be at most 30 characters' })
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message:
      'Username can only contain letters, numbers, periods and underscores',
  })
  username: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must be at most 72 characters' })
  password: string;

  @Field()
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(80)
  firstName: string;

  @Field()
  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(80)
  lastName: string;

  // Accepts an ISO date string ("YYYY-MM-DD"), as produced by an <input type="date">.
  @Field()
  @IsDateString({}, { message: 'Birth date must be a valid date' })
  birthDate: string;
}
