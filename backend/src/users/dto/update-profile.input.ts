import { InputType, Field } from '@nestjs/graphql';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class UpdateProfileInput {
  // Validate only when a non-empty value is sent; an empty string clears the
  // username (stored as null).
  @Field({ nullable: true })
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must be at most 30 characters' })
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message:
      'Username can only contain letters, numbers, periods and underscores',
  })
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  // ISO date string ("YYYY-MM-DD") or empty string to clear.
  @Field({ nullable: true })
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsDateString({}, { message: 'Birth date must be a valid date' })
  birthDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @Field({ nullable: true })
  // Allow clearing the avatar by sending an empty string; validate as URL only
  // when a non-empty value is provided.
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsUrl({ require_protocol: true }, { message: 'Avatar must be a valid URL' })
  @MaxLength(2048)
  avatarUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;
}
