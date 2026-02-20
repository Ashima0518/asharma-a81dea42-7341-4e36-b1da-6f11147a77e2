import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../../database/entities/user.entity.js';
import { OrganizationEntity } from '../../database/entities/organization.entity.js';
import { UserRole } from '@org/data';
import type { RegisterDto, LoginDto, JwtPayload } from '@org/data';

export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        organizationId: string;
    };
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(OrganizationEntity)
        private readonly orgRepo: Repository<OrganizationEntity>,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Register a new user.
     * - Hashes the password with bcrypt (10 rounds)
     * - Returns a signed JWT
     */
    async register(dto: RegisterDto): Promise<AuthResponse> {
        const existingEmail = await this.userRepo.findOne({
            where: { email: dto.email },
        });
        if (existingEmail) {
            throw new ConflictException('Email is already registered');
        }

        const existingOrg = await this.orgRepo.findOne({
            where: { name: dto.organizationName },
        });
        if (existingOrg) {
            throw new ConflictException('Organization name is already taken');
        }

        const hashed = await bcrypt.hash(dto.password, 10);

        // Create the new root organization
        const org = this.orgRepo.create({
            name: dto.organizationName,
        });
        await this.orgRepo.save(org);

        const user = this.userRepo.create({
            email: dto.email,
            password: hashed,
            name: dto.name,
            organizationId: org.id,
            role: UserRole.OWNER,
        });

        await this.userRepo.save(user);
        return this.buildAuthResponse(user);
    }

    /**
     * Log in with email + password.
     * Throws 401 for unknown email or wrong password.
     */
    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatch = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.buildAuthResponse(user);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private buildAuthResponse(user: UserEntity): AuthResponse {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        };

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: user.organizationId,
            },
        };
    }
}
