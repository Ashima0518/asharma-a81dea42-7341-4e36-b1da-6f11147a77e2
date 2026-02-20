import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../../database/entities/organization.entity.js';
import type { JwtPayload } from '@org/data';

@Injectable()
export class OrgsService {
    constructor(
        @InjectRepository(OrganizationEntity)
        private readonly orgRepo: Repository<OrganizationEntity>,
    ) { }

    /**
     * Create a new sub-organization under the caller's organization.
     */
    async createSubOrg(caller: JwtPayload, name: string): Promise<OrganizationEntity> {
        // Check if name is taken
        const existing = await this.orgRepo.findOne({ where: { name } });
        if (existing) {
            throw new ConflictException('Organization name already in use');
        }

        const org = this.orgRepo.create({
            name,
            parentId: caller.organizationId,
        });

        return this.orgRepo.save(org);
    }

    /**
     * Get the caller's organization and its immediate children.
     * Note: A full recursive tree would require a CTE, but for a 2-level hierarchy,
     * fetching the org and its direct children is sufficient.
     */
    async getOrgTree(caller: JwtPayload): Promise<OrganizationEntity> {
        return this.orgRepo.findOneOrFail({
            where: { id: caller.organizationId },
            relations: ['children'],
        });
    }
}
