import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@org/auth';
import type { JwtPayload } from '@org/data';
import { RegisterDto, LoginDto } from '@org/data';
import { CurrentUser } from '@org/auth';
import { AuthService } from './auth.service.js';

/**
 * Authentication endpoints.
 *
 * POST /auth/register  – create a new account
 * POST /auth/login     – obtain a JWT
 * GET  /auth/profile   – return the current user (JWT required)
 */
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    /**
     * Protected endpoint – demonstrates the JWT guard.
     * Returns the claims from the token (sub, email, role, organizationId).
     */
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@CurrentUser() user: JwtPayload) {
        return { user };
    }
}
