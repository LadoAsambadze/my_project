import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [PassportModule, PagesModule],
  providers: [EventsService, EventsResolver],
})
export class EventsModule {}
