import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { ContentTarget } from '../../common/content-target.enum';

@InputType()
export class CreateCommentInput {
  @Field(() => ContentTarget, {
    description: 'What kind of content the comment is on.',
  })
  @IsEnum(ContentTarget)
  target: ContentTarget;

  @Field(() => ID, { description: 'Id of the content being commented on.' })
  @IsString()
  targetId: string;

  @Field({ description: 'Text of the comment.' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body: string;
}
