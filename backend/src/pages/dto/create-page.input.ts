import { InputType, Field } from '@nestjs/graphql';
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

@InputType()
export class CreatePageInput {
  @Field({ description: 'Display name of the page.' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @Field(() => [PageType], {
    description: 'Vendor categories — at least one, no duplicates.',
  })
  @IsArray()
  @ArrayMinSize(1)
  // A page can carry every category at most — track the enum so adding a new
  // PageType never silently breaks this cap.
  @ArrayMaxSize(Object.keys(PageType).length)
  @ArrayUnique()
  @IsEnum(PageType, { each: true })
  types: PageType[];

  @Field(() => String, {
    nullable: true,
    description: 'URL returned by the /uploads endpoint for the page photo.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  photoUrl?: string;
}
