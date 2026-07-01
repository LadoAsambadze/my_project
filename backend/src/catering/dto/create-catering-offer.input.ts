import { InputType, Field, ID, Int } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateCateringOfferInput {
  @Field(() => ID, {
    description: 'The CATERING page to publish under (you must own it).',
  })
  @IsString()
  pageId: string;

  @Field({ description: 'Title of the offer.' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @Field({
    description: 'Kind label from the frontend catalog (e.g. "FURSHET").',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  kind: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Optional per-guest price in GEL.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  pricePerPerson?: number;

  @Field(() => [String], {
    description:
      'Photo URLs returned by the /uploads endpoint, in display order.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  imageUrls: string[];
}
