import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OfferingsService } from './offerings.service';
import { OfferingsResolver } from './offerings.resolver';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [PassportModule, PagesModule],
  providers: [OfferingsService, OfferingsResolver],
})
export class OfferingsModule {}
