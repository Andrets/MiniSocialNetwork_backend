import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { EmailorID, UserDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
    ){}

    async create(user: UserDto): Promise<User> {
        return this.prisma.user.create({
            data: {
                nickname: user.nickname,
                password: user.password,
                email: user.email,
            }
        })
    }

    async getOne(id: number): Promise<User> {
        return await this.prisma.user.findUnique({
            where: {
                id
            }
        })
    }

    async getAll(): Promise<User[]> {
        return await this.prisma.user.findMany()
    }

    async delete(id: number): Promise<User> {
        return await this.prisma.user.delete({
            where: {
                id
            }
        })
    }
}
