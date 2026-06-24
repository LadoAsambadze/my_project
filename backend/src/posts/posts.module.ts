import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { UploadsController } from './uploads.controller';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [PassportModule, PagesModule],
  providers: [PostsService, PostsResolver],
  controllers: [UploadsController],
})
export class PostsModule {}
