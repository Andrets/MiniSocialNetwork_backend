import { Controller, Delete, Get, Param, ParseUUIDPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { CurrentUser } from '@app/lib/decorators';
import { JwtPayload } from 'src/auth/interfaces';
import { UserResponse } from './responses';


@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}
    
    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':idOrEmail')
    async getOne(@Param('idOrEmail') idOrEmail: string) {
        const user = await this.userService.getOne(idOrEmail)
        return new UserResponse(user)
    }

    @Delete(':id')
    async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
        return await this.userService.delete(id, user)
    }
    
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('get')
    async getAll(): Promise<User[]> {
        return await this.userService.getAll()
    }

}
