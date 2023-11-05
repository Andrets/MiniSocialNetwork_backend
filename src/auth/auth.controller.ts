import { Cookie, Public } from '@app/lib/decorators';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserResponse } from 'src/user/responses';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Tokens } from './interfaces';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new BadRequestException(
        `Can not register that user with that data ${JSON.stringify(dto)}`,
      );
    }
    return new UserResponse(user);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const agent = req.headers['user-agent'];
    const tokens = await this.authService.login(dto, agent);
    if (!tokens) {
      throw new BadRequestException(
        `Error while entering with ${JSON.stringify(dto)}`,
      );
    }
    this.setRefreshTokenToCookies(tokens, res);
  }

  @Get('logout')
  async logout(
    @Cookie('refresh_token') refreshToken: string,
    @Res() res: Response,
  ) {
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);
      return;
    }
    await this.authService.deleteRefreshToken(refreshToken);
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: true,
      expires: new Date(),
    });
    res.sendStatus(HttpStatus.OK);
  }

  @Get('refresh-tokens')
  async refreshTokens(
    @Cookie('refresh_token') refreshToken: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const agent = req.headers['user-agent'];
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(refreshToken, agent);
    if (!tokens) {
      throw new UnauthorizedException();
    }
    this.setRefreshTokenToCookies(tokens, res);
  }

  private async setRefreshTokenToCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }
    res.cookie('refresh_token', tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.exp),
      secure: false,
      path: '/',
    });
    res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
  }
}
