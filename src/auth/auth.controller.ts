import { BadRequestException, UnauthorizedException, Body, Controller, Logger, Post, HttpStatus, Res, Get, Req, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Tokens } from './interfaces';
import { Request, Response } from 'express';
import { Cookie, Public } from '@app/lib/decorators';
import { UserResponse } from 'src/user/responses';



@Public()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}
    
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        const user = await this.authService.register(dto)
        if (!user) {
            throw new BadRequestException(`Can not register that user with that data ${JSON.stringify(dto)}`)
        }
        return new UserResponse(user);
    }

    @Post('login')
    async login(@Body() dto: LoginDto, @Res() res: Response, @Req() req: Request) {
        const agent = req.headers['user-agent']
        const tokens = await this.authService.login(dto, agent)
        if (!tokens) {
            throw new BadRequestException(`Error while entering with ${JSON.stringify(dto)}`)
        }
        this.setRefreshTokenToCookies(tokens, res)
    }

    @Get('refresh-tokens')
    async refreshTokens(@Cookie('refresh_token') refreshToken: string, @Res() res: Response, @Req() req: Request) {
        const agent = req.headers['user-agent']
        if (!refreshToken) {    
            throw new UnauthorizedException()
        }
        const tokens = await this.authService.refreshTokens(refreshToken, agent)
        if (!tokens) {
            throw new UnauthorizedException()
        }
        this.setRefreshTokenToCookies(tokens, res)
    }

    private async setRefreshTokenToCookies(tokens: Tokens, res: Response) {
        if(!tokens) {
            throw new UnauthorizedException()
        }
        res.cookie('refresh_token', tokens.refreshToken.token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(tokens.refreshToken.exp),
            secure: false,
            path: '/'
        })
        res.status(HttpStatus.CREATED).json({accessToken: tokens.accessToken})
    }
}
