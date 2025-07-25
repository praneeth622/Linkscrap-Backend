import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from './supabase.config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const user = await this.supabaseService.verifyToken(token);
      
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Attach user to request object
      request.user = user;
      request.userId = user.id;

      return true;
    } catch (error) {
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
    }
  }
}
