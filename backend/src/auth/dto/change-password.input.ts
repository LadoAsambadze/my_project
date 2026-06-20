import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  // Optional: not required for OAuth-only accounts that have no password yet.
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must be at most 72 characters' })
  newPassword: string;
}
