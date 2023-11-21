import { CurrentUser } from '@app/lib/decorators';
import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { Chat, User } from '@prisma/client';
import { JwtPayload } from 'src/auth/interfaces';
import { UserResponse } from './responses';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':idOrEmail')
  async getOne(@Param('idOrEmail') idOrEmail: string) {
    const user = await this.userService.getOne(idOrEmail);
    return new UserResponse(user);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.userService.delete(id, user);
  }

  @Get()
  async getAll(): Promise<User[]> {
    return await this.userService.getAll();
  }

  @Get('room/:roomid')
  async getOneRoom(@Param('roomid') roomid: string): Promise<Chat> {
    return await this.userService.getOneRoom(roomid);
  }

  @Get('rooms')
  async getAllRooms(): Promise<Chat[]> {
    return await this.userService.getAllRooms();
  }
}
