import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../database/entities/user.entity.js';
import { UserRole } from '@org/data';
import type { JwtPayload } from '@org/data';
import type { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
    ) { }

    async listUsers(caller: JwtPayload): Promise<Omit<UserEntity, 'password'>[]> {
        const users = await this.userRepo.find({
            where: { organizationId: caller.organizationId },
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return users.map(({ password, ...rest }) => rest);
    }

    async createUser(caller: JwtPayload, dto: CreateUserDto): Promise<Omit<UserEntity, 'password'>> {
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            name: dto.name,
            email: dto.email,
            password: hashed,
            role: dto.role ?? UserRole.VIEWER,
            organizationId: caller.organizationId,
        });

        await this.userRepo.save(user);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result as any; // Type assertion since TypeORM's create returns the class instance
    }

    async deleteUser(caller: JwtPayload, id: string): Promise<{ deleted: true }> {
        const target = await this.userRepo.findOne({ where: { id } });
        if (!target) {
            throw new NotFoundException('User not found');
        }

        if (target.organizationId !== caller.organizationId) {
            throw new ForbiddenException('You can only delete users in your organization');
        }

        // Prevent deleting oneself
        if (target.id === caller.sub) {
            throw new ForbiddenException('Cannot delete yourself');
        }

        await this.userRepo.remove(target);
        return { deleted: true };
    }
}
