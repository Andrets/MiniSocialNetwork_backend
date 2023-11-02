import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { EmailorID, UserDto } from './dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @Post()
    async create(@Body(new ValidationPipe()) user: UserDto): Promise<User> {
        return await this.userService.create(user)
    }
     
    @Get(':idOrEmail')
    async getOne(@Param('idOrEmail') idOrEmail: string) {
        return await this.userService.getOne(idOrEmail)
    }
    
    @Get('get')
    async getAll(): Promise<User[]> {
        return await this.userService.getAll()
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: string) {
        return await this.userService.delete(id)
    }

}
