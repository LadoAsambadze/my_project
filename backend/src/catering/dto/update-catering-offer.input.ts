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

/// Partial update of a menu offer. Omitted fields keep their value; providing
/// `imageUrls` replaces the whole photo list.
@InputType()
export class UpdateCateringOfferInput {
  @Field(() => ID, {
    description: 'The offer to update (you must own its page).',
  })
  @IsString()
  offerId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  kind?: string;

  @Field(() => String, {
    nullable: true,
    description: 'New description; empty string clears it.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'New per-guest price in GEL; -1 clears it.',
  })
  @IsOptional()
  @IsInt()
  @Min(-1)
  pricePerPerson?: number;

  @Field(() => [String], {
    nullable: true,
    description: 'Replaces the whole photo list when provided.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  imageUrls?: string[];
}
