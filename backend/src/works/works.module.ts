import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { WorksService } from './works.service';
import { WorksResolver } from './works.resolver';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [PassportModule, PagesModule],
  providers: [WorksService, WorksResolver],
})
export class WorksModule {}
