import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { STRATEGIES } from 'src/auth/strategies';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { options } from '../auth/config';
import { ChatService } from './chat.service';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync(options()),
    CacheModule.register(),
  ],
  providers: [...STRATEGIES, UserService, PrismaService, ChatService],
})
export class ChatModule {}
