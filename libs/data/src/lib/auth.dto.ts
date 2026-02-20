import { IsEmail, IsString, MinLength } from 'class-validator';

// ─── Register DTO ────────────────────────────────────────────────────────────

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsString()
    name!: string;

    /** Name of the new organization to create for the registering user */
    @IsString()
    organizationName!: string;
}

// ─── Login DTO ───────────────────────────────────────────────────────────────

export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;
}

// ─── JWT payload shape (used in Strategy + Service) ──────────────────────────

export interface JwtPayload {
    sub: string;   // user UUID
    email: string;
    role: string;
    organizationId: string;
}
