import { Public } from '@app/lib/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import { GoogleService } from './google.service';

@Controller('google')
@Public()
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get()
  async getGoogle(): Promise<string> {
    return await this.googleService.getGoogle();
  }
}
