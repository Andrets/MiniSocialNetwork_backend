import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { options } from './config';
import { GUARDS } from './guards';
import { STRATEGIES } from './strategies';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync(options()),
    PassportModule,
    CacheModule.register(),
  ],
  providers: [
    AuthService,
    UserService,
    PrismaService,
    ...STRATEGIES,
    ...GUARDS,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
