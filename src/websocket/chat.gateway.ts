import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthWsGuard } from './guards/auth-ws.guard';

@WebSocketGateway(80, {
  cors: {
    origin: '*',
  },
})
@UseGuards(AuthWsGuard)
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody('id') id: number,
    @ConnectedSocket() client: Socket,
  ): number {
    return id;
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
