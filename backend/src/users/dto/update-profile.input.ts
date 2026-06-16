import { InputType, Field } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

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
