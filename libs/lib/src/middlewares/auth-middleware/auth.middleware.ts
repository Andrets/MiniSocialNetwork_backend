import { NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

export class authMiddleWare implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new UnauthorizedException();
      }
      const user = await this.jwtService.verifyAsync(token);
      if (!user) {
        throw new UnauthorizedException();
      }
      req['user'] = user;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ error: 'Auth failed' });
    }
  }
}
