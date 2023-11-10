import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { FilesModule } from './files/files.module';
import { GoogleModule } from './google/google.module';
import { UserModule } from './user/user.module';
import { EventsModule } from './websocket/chat.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    FilesModule,
    GoogleModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
