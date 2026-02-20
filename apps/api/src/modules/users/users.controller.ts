import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@org/auth';
import type { JwtPayload } from '@org/data';
import { UserRole } from '@org/data';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

interface AuthRequest {
    user: JwtPayload;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    async listUsers(@Request() req: AuthRequest) {
        return this.usersService.listUsers(req.user);
    }

    @Post()
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    async createUser(@Request() req: AuthRequest, @Body() dto: CreateUserDto) {
        return this.usersService.createUser(req.user, dto);
    }

    @Delete(':id')
    @Roles(UserRole.OWNER)
    async deleteUser(@Request() req: AuthRequest, @Param('id') id: string) {
        return this.usersService.deleteUser(req.user, id);
    }
}
