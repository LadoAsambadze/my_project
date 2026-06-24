import { InputType, Field } from '@nestjs/graphql';
import { PageType } from '@prisma/client';
import {
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

  @Field(() => PageType, {
    nullable: true,
    description: 'Thematic category. Defaults to PHOTOGRAPHER if omitted.',
  })
  @IsOptional()
  @IsEnum(PageType)
  type?: PageType;

  @Field(() => String, {
    nullable: true,
    description: 'URL returned by the /uploads endpoint for the page photo.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  photoUrl?: string;
}
