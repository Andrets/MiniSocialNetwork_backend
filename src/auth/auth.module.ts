import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { options } from './config';

@Module({
  imports: [UserModule, JwtModule.registerAsync(options()), PassportModule],
  providers: [AuthService, UserService, PrismaService],
  controllers: [AuthController]
})
export class AuthModule {}
