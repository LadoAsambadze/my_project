import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DesignsService } from './designs.service';
import { DesignsResolver } from './designs.resolver';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [PassportModule, PagesModule],
  providers: [DesignsService, DesignsResolver],
})
export class DesignsModule {}
