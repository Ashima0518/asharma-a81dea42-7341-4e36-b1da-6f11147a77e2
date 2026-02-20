import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from '../../database/entities/task.entity.js';
import { OrganizationEntity } from '../../database/entities/organization.entity.js';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([TaskEntity, OrganizationEntity]),
        AuditModule,   // provides AuditService
    ],
    controllers: [TasksController],
    providers: [TasksService],
})
export class TasksModule { }
