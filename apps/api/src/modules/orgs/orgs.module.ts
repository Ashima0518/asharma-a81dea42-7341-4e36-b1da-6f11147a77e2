import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from '../../database/entities/organization.entity.js';
import { OrgsService } from './orgs.service.js';
import { OrgsController } from './orgs.controller.js';

@Module({
    imports: [TypeOrmModule.forFeature([OrganizationEntity])],
    providers: [OrgsService],
    controllers: [OrgsController],
    exports: [OrgsService],
})
export class OrgsModule { }
