import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FloristService } from './florist.service';
import { FloristResolver } from './florist.resolver';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [PassportModule, PagesModule],
  providers: [FloristService, FloristResolver],
})
export class FloristModule {}
