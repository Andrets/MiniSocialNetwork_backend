import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { EmailorID, UserDto } from './dto';
import { User } from '@prisma/client';
import { genSaltSync, hash, hashSync } from 'bcrypt';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)
    constructor(
        private readonly prisma: PrismaService,
    ){}

    async create(user: UserDto): Promise<User> {
        const hashpassword = await this.hashPassword(user.password)
        try {
            return this.prisma.user.create({
                data: {
                    nickname: user.nickname,
                    password: hashpassword,
                    email: user.email,
                }
            })
        } catch(err) {
            this.logger.error(err);
            return null
        }
    }

    async getOne(idOrEmail: string) {
        return await this.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        id: idOrEmail
                    },
                    {
                        email: idOrEmail
                    }
                ]
            }
        })
    }

    async getAll(): Promise<User[]> {
        return await this.prisma.user.findMany()
    }

    async delete(id: string) {
        return await this.prisma.user.delete({
            where: {
                id
            }
        })
    }

    private async hashPassword(password: string): Promise<string> {
        return hashSync(password, genSaltSync(10))
    }
}
