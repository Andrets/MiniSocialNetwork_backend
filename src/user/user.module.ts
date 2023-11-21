import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [CacheModule.register()],
  providers: [UserService, PrismaService],
  controllers: [UserController],
  exports: [CacheModule],
})
export class UserModule {}
