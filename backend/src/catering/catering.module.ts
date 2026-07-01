import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CateringService } from './catering.service';
import { CateringResolver } from './catering.resolver';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [PassportModule, PagesModule],
  providers: [CateringService, CateringResolver],
})
export class CateringModule {}
