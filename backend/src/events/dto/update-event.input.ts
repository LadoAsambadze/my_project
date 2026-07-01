import { InputType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { EventType } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/// Partial update of an event. Omitted fields keep their value; for the
/// nullable text fields an empty string clears the stored value.
@InputType()
export class UpdateEventInput {
  @Field(() => ID, { description: 'The event to update (you must be its author).' })
  @IsString()
  eventId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @Field(() => EventType, { nullable: true })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @Field(() => String, {
    nullable: true,
    description: 'New subtype; empty string clears it.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  subtype?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  startsAt?: Date;

  @Field(() => String, {
    nullable: true,
    description: 'New location; empty string clears it.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @Field(() => String, {
    nullable: true,
    description: 'New description; empty string clears it.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @Field(() => String, {
    nullable: true,
    description: 'New cover URL; empty string removes the cover.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverUrl?: string;
}
