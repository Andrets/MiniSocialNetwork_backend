import { BadGatewayException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { ChatService } from './chat.service';
import { IStartChat } from './dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
  ) {}
  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    try {
      const user = await this.chatService.connectToSocket(client);
      client['user'] = user;
    } catch (error) {
      console.error(error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket, ...args: any[]) {
    client.disconnect();
    console.log(`Client has been disconnected: ${client.id}`);
  }

  @SubscribeMessage('startChatwithUser')
  async handleStartChatwithUser(
    @MessageBody() dto: IStartChat,
    @ConnectedSocket() client: Socket,
  ) {
    const users =
      (await this.userService.getOne(dto.currentUser)) ||
      (await this.userService.getOne(dto.otherUser));
    if (!users) {
      throw new NotFoundException();
    }
    if (dto.currentUser !== dto.otherUser) {
      const room: any = await this.chatService.createPrivateRoom(dto);
      client.join(room);
      client.emit('chat started', room);
      return room;
    } else {
      client.emit('chat error', {
        message: 'You cannot start chat with yourself',
      });
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    const user = client['user'];
    try {
      if (!user) {
        throw new BadGatewayException();
      }
    } catch (err) {
      console.error(err);
    }
    client.join(room);
    client.emit('chat started', room);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    { message, room }: { message: string; room: string },
  ) {
    const user = client['user'];
    try {
      if (!user) {
        throw new BadGatewayException();
      }
    } catch (error) {
      console.log('Error while sending message', error);
    }
    this.server.to(room).emit('newMessage', { message, sender: client.id });
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, room: string) {
    await client.leave(room);
    console.log(`${client.id} has been leaved out of room ${room}`);
  }

  private async generatePrivateRoom(dto: IStartChat) {
    return `${dto.currentUser}_${dto.otherUser}`;
  }

  private async findSocketById(clientId: string) {
    return this.server.sockets.sockets.get(clientId);
  }
}
