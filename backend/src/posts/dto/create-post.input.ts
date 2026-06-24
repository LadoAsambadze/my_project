import { InputType, Field, ID } from '@nestjs/graphql';
import { MediaType } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class PostMediaInput {
  @Field({ description: 'URL returned by the /uploads endpoint.' })
  @IsString()
  @MaxLength(2048)
  url: string;

  @Field(() => MediaType)
  @IsEnum(MediaType)
  type: MediaType;
}

@InputType()
export class CreatePostInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  body?: string;

  @Field(() => ID, {
    nullable: true,
    description:
      'Publish the post as this page (you must own it). Omit for a personal post.',
  })
  @IsOptional()
  @IsString()
  pageId?: string;

  @Field(() => [PostMediaInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PostMediaInput)
  media?: PostMediaInput[];
}
