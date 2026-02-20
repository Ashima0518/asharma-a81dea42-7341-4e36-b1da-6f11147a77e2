import {
    Controller,
    Get,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@org/auth';
import type { JwtPayload } from '@org/data';
import { AuditService } from './audit.service.js';
import { UserRole } from '@org/data';

interface AuthRequest {
    user: JwtPayload;
}

/**
 * GET /audit-log       – full org log (OWNER or ADMIN only)
 * GET /audit-log/me    – own log (any authenticated user)
 */
@UseGuards(JwtAuthGuard)
@Controller('audit-log')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    /**
     * Return every audit log in the caller's organisation.
     * Restricted to OWNER and ADMIN.
     */
    @Get()
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @UseGuards(RolesGuard)
    async getAll(@Request() req: AuthRequest) {
        const user = req.user;
        return this.auditService.findAllForOrg(user.organizationId);
    }

    /**
     * Return only the caller's own audit log entries.
     * Available to any authenticated user.
     */
    @Get('me')
    async getMine(@Request() req: AuthRequest) {
        const user = req.user;
        return this.auditService.findForUser(user.sub, user.organizationId);
    }
}
