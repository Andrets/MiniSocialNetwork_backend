import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponse implements User {
  id: string;
  email: string;
  nickname: string;
  @Exclude()
  password: string;

  @Exclude()
  createdAt: Date;

  updatedAt: Date;

  @Exclude()
  chatId: string;

  constructor(user: User) {
    Object.assign(this, user);
  }
}
