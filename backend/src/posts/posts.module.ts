import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [PassportModule],
  providers: [PostsService, PostsResolver],
  controllers: [UploadsController],
})
export class PostsModule {}
