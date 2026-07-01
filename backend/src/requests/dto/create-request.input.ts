import { InputType, Field, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { PageType } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateRequestInput {
  @Field(() => PageType, {
    description: 'Which vendor category this request targets.',
  })
  @IsEnum(PageType)
  category: PageType;

  @Field(() => String, {
    nullable: true,
    description: 'Occasion label from the frontend catalog (e.g. "WEDDING").',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  occasion?: string;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'When the event takes place.',
  })
  @IsOptional()
  @IsDate()
  eventDate?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @Field(() => Int, { nullable: true, description: 'Budget lower bound, GEL.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  budgetFrom?: number;

  @Field(() => Int, { nullable: true, description: 'Budget upper bound, GEL.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  budgetTo?: number;

  @Field({ description: 'Free-text description of what is needed.' })
  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  body: string;
}
