import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleService {
  async getGoogle() {
    return 'Hello!';
  }
}
