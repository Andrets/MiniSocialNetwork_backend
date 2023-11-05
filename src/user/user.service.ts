import { convertToSecondsUtil } from '@app/lib/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
import { Cache } from 'cache-manager';
import { RegisterDto } from 'src/auth/dto';
import { JwtPayload } from 'src/auth/interfaces';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cachgeManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async create(user: RegisterDto): Promise<User> {
    const hashpassword = await this.hashPassword(user.password);
    try {
      return this.prisma.user.create({
        data: {
          nickname: user.nickname,
          password: hashpassword,
          email: user.email,
        },
      });
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }

  async getOne(idOrEmail: string, isReset = false) {
    if (isReset) {
      await this.cachgeManager.del(idOrEmail);
    }
    const user = await this.cachgeManager.get<User>(idOrEmail);
    if (!user) {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              id: idOrEmail,
            },
            {
              email: idOrEmail,
            },
          ],
        },
      });
      if (!user) {
        return null;
      }
      await this.cachgeManager.set(
        idOrEmail,
        user,
        convertToSecondsUtil(this.configService.get('JWT_EXP')),
      );
      return user;
    }
    return user;
  }

  async getAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async delete(id: string, user: JwtPayload) {
    if (user.id !== id) {
      throw new ForbiddenException();
    }
    await Promise.all([
      this.cachgeManager.del(id),
      this.cachgeManager.del(user.email),
    ]);
    return this.prisma.user.delete({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return hashSync(password, genSaltSync(10));
  }
}
