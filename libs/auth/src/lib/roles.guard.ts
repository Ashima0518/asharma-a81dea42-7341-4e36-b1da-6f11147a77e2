import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator.js';
import { UserRole } from '@org/data';
import type { JwtPayload } from '@org/data';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true; // No roles restricted
        }
        const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
        if (!user || !user.role) {
            return false;
        }

        return requiredRoles.includes(user.role as UserRole);
    }
}
