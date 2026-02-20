import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@org/data';

/**
 * Parameter decorator that extracts the JWT payload from the request.
 *
 * @example
 *   getProfile(@CurrentUser() user: JwtPayload) { return user; }
 */
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): JwtPayload => {
        const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
        return request.user;
    },
);
