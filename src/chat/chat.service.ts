import { convertToSecondsUtil } from '@app/lib/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket } from '@nestjs/websockets';
import { Chat } from '@prisma/client';
import { Cache } from 'cache-manager';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
import { IStartChat } from './dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async connectToSocket(@ConnectedSocket() client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException();
    }
    const user = await this.jwtService
      .verifyAsync(token, {
        secret: await this.configService.get('JWT_SECRET'),
      })
      .catch((err) => {
        this.logger.error(err);
      });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async createPrivateRoom(dto: IStartChat) {
    const room = `${dto.currentUser}_${dto.otherUser}`;
    return await this.prisma.chat
      .create({ data: { chat_id: room } })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  async getOneRoom(dto: IStartChat) {
    const room = await this.cacheManager.get<Chat>(
      `${dto.currentUser}_${dto.otherUser}`,
    );
    if (!room) {
      const room = await this.prisma.chat.findFirst({
        where: {
          chat_id: `${dto.currentUser}_${dto.otherUser}`,
        },
      });
      if (!room) {
        return null;
      }
      await this.cacheManager.set(
        `${dto.currentUser}_${dto.otherUser}`,
        room,
        convertToSecondsUtil(this.configService.get('JWT_EXP')),
      );
      return room;
    }
    return room;
  }
}
