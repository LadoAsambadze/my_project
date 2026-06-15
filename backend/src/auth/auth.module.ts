import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // Secrets/expiry are passed per-call in AuthService (two different secrets),
    // so JwtModule just provides the JwtService.
    JwtModule.register({}),
  ],
  providers: [AuthService, AuthResolver, JwtAccessStrategy],
})
export class AuthModule {}
