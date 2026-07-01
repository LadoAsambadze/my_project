import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FeedService } from './feed.service';
import { FeedResolver } from './feed.resolver';

@Module({
  imports: [PassportModule],
  providers: [FeedService, FeedResolver],
})
export class FeedModule {}
