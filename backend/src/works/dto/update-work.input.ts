import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';
import { WorkMediaInput } from './create-work.input';

/// Partial update of a work. Omitted fields keep their value; providing
/// `media` replaces the whole media list.
@InputType()
export class UpdateWorkInput {
  @Field(() => ID, { description: 'The work to update (you must own its page).' })
  @IsString()
  workId: string;

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
  category?: string;

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
    description: 'New starting price in GEL; -1 clears it.',
  })
  @IsOptional()
  @IsInt()
  @Min(-1)
  priceFrom?: number;

  @Field(() => [WorkMediaInput], {
    nullable: true,
    description: 'Replaces the whole media list when provided.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(15)
  @ValidateNested({ each: true })
  @Type(() => WorkMediaInput)
  media?: WorkMediaInput[];
}
