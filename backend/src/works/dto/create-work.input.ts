import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { MediaType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

@InputType()
export class WorkMediaInput {
  @Field({ description: 'URL returned by the /uploads endpoint.' })
  @IsString()
  @MaxLength(2048)
  url: string;

  @Field(() => MediaType)
  @IsEnum(MediaType)
  type: MediaType;
}

@InputType()
export class CreateWorkInput {
  @Field(() => ID, {
    description: 'The Photo & Video page to publish under (you must own it).',
  })
  @IsString()
  pageId: string;

  @Field({ description: 'Title of the work.' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @Field({
    description: 'Category label from the frontend catalog (e.g. "WEDDING").',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  category: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Optional starting price in GEL.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceFrom?: number;

  @Field(() => [WorkMediaInput], {
    description: 'Photos/videos in display order.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(15)
  @ValidateNested({ each: true })
  @Type(() => WorkMediaInput)
  media: WorkMediaInput[];
}
