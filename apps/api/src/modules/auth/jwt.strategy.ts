import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '@org/data';

/**
 * Validates the JWT bearer token.
 * The returned object becomes `req.user` in all guarded routes.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET', 'dev_secret_change_me'),
        });
    }

    validate(payload: JwtPayload): JwtPayload {
        // Passport attaches the return value as req.user
        return payload;
    }
}
