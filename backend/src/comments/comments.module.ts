import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import {
  CommentsResolver,
  COMMENT_FIELD_RESOLVERS,
} from './comments.resolver';

@Module({
  imports: [PassportModule],
  providers: [CommentsService, CommentsResolver, ...COMMENT_FIELD_RESOLVERS],
})
export class CommentsModule {}
