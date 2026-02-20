import {
    Controller,
    Get,
    Post,
    Body,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@org/auth';
import type { JwtPayload } from '@org/data';
import { UserRole } from '@org/data';
import { OrgsService } from './orgs.service.js';
import { CreateOrgDto } from './dto/create-org.dto.js';

interface AuthRequest {
    user: JwtPayload;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orgs')
export class OrgsController {
    constructor(private readonly orgsService: OrgsService) { }

    @Get()
    async getTree(@Request() req: AuthRequest) {
        return this.orgsService.getOrgTree(req.user);
    }

    @Post()
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    async createSubOrg(@Request() req: AuthRequest, @Body() dto: CreateOrgDto) {
        return this.orgsService.createSubOrg(req.user, dto.name);
    }
}
