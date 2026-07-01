import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LikesService } from './likes.service';
import { LikesResolver, LIKE_FIELD_RESOLVERS } from './likes.resolver';

@Module({
  imports: [PassportModule],
  providers: [LikesService, LikesResolver, ...LIKE_FIELD_RESOLVERS],
})
export class LikesModule {}
