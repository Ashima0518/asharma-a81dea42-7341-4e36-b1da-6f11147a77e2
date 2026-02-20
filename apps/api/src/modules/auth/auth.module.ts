import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../../database/entities/user.entity.js';
import { OrganizationEntity } from '../../database/entities/organization.entity.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';

/**
 * Self-contained authentication module.
 *
 * Exports PassportModule so other feature modules can apply JwtAuthGuard
 * without importing PassportModule themselves.
 */
@Module({
    imports: [
        /** Makes ConfigService available in this module's providers */
        ConfigModule,

        /** Register Passport with the default strategy */
        PassportModule.register({ defaultStrategy: 'jwt' }),

        /**
         * Register JwtModule asynchronously so it picks up JWT_SECRET from the
         * environment instead of hard-coding it.
         */
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET', 'dev_secret_change_me'),
                signOptions: { expiresIn: '8h' },
            }),
        }),

        /** Give AuthService access to the User and Organization tables */
        TypeOrmModule.forFeature([UserEntity, OrganizationEntity]),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [PassportModule, JwtModule],
})
export class AuthModule { }
