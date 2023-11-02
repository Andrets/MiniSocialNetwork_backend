import { Body, Controller, Get, Param, ParseIntPipe, Post, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { EmailorID, UserDto } from './dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @Post('create')
    async create(@Body(new ValidationPipe()) user: UserDto): Promise<User> {
        return await this.userService.create(user)
    }
     
    @Get('get/:id')
    async getOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return await this.userService.getOne(id)
    }
    
    @Get('get')
    async getAll(): Promise<User[]> {
        return await this.userService.getAll()
    }

    @Get('delete/:id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return await this.userService.delete(id)
    }

}
