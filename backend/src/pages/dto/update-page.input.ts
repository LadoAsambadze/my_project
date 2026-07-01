import { InputType, Field, ID } from '@nestjs/graphql';
import { PageType } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/// Partial update of one of your own pages. Omitted fields are left as they
/// are; for the nullable contact fields an empty string clears the value.
@InputType()
export class UpdatePageInput {
  @Field(() => ID, { description: 'The page to update (you must own it).' })
  @IsString()
  pageId: string;

  @Field(() => String, {
    nullable: true,
    description: 'New display name.',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @Field(() => [PageType], {
    nullable: true,
    description: 'New vendor categories — at least one, no duplicates.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  // A page can carry every category at most — track the enum so adding a new
  // PageType never silently breaks this cap.
  @ArrayMaxSize(Object.keys(PageType).length)
  @ArrayUnique()
  @IsEnum(PageType, { each: true })
  types?: PageType[];

  @Field(() => String, {
    nullable: true,
    description:
      'New photo URL from /uploads; pass an empty string to remove the photo.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  photoUrl?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Contact phone; empty string clears it.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @Field(() => String, {
    nullable: true,
    description: 'WhatsApp number; empty string clears it.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Telegram username (with or without @); empty string clears it.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  telegram?: string;

  @Field(() => [String], {
    nullable: true,
    description:
      'Instruments a MUSIC_SOUND page plays (catalog ids, e.g. "SAXOPHONE"); pass an empty list to clear.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  instruments?: string[];
}
