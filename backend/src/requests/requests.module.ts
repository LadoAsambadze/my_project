import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RequestsService } from './requests.service';
import { RequestsResolver } from './requests.resolver';

@Module({
  imports: [PassportModule],
  providers: [RequestsService, RequestsResolver],
})
export class RequestsModule {}
