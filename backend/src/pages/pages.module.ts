import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PagesService } from './pages.service';
import { PagesResolver } from './pages.resolver';

@Module({
  imports: [PassportModule],
  providers: [PagesService, PagesResolver],
  exports: [PagesService],
})
export class PagesModule {}
