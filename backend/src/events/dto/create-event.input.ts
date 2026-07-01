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

@InputType()
export class CreateEventInput {
  @Field({ description: 'Title of the event.' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @Field(() => EventType, {
    nullable: true,
    description: 'Category of the event. Defaults to OTHER if omitted.',
  })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @Field(() => String, {
    nullable: true,
    description: 'Second-level category within `type` (e.g. "TENNIS" for SPORT).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  subtype?: string;

  @Field(() => GraphQLISODateTime, { description: 'When the event takes place.' })
  @IsDate()
  startsAt: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Cover photo URL returned by the /uploads endpoint.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverUrl?: string;

  @Field(() => ID, {
    nullable: true,
    description:
      'Host the event as this page (you must own it). Omit for a personal event.',
  })
  @IsOptional()
  @IsString()
  pageId?: string;
}
