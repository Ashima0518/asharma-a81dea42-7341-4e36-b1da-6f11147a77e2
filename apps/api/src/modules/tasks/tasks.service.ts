import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Request } from 'express';
import { TaskEntity } from '../../database/entities/task.entity.js';
import { OrganizationEntity } from '../../database/entities/organization.entity.js';
import { UserRole, TaskCategory } from '@org/data';
import type { JwtPayload } from '@org/data';
import { AuditService } from '../audit/audit.service.js';
import type { CreateTaskDto } from './dto/create-task.dto.js';
import type { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskEntity)
        private readonly taskRepo: Repository<TaskEntity>,
        @InjectRepository(OrganizationEntity)
        private readonly orgRepo: Repository<OrganizationEntity>,
        private readonly auditService: AuditService,
    ) { }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private ipFrom(req?: Request): string | undefined {
        return (
            (req?.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
            req?.socket?.remoteAddress
        );
    }

    private uaFrom(req?: Request): string | undefined {
        return req?.headers['user-agent'];
    }

    private async logTaskAudit(
        action: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK',
        resourceId: string,
        details: Record<string, any>,
        caller: JwtPayload,
        req?: Request,
    ): Promise<void> {
        await this.auditService.log({
            action,
            resource: 'Task',
            resourceId,
            details,
            userId: caller.sub,
            organizationId: caller.organizationId,
            ipAddress: this.ipFrom(req),
            userAgent: this.uaFrom(req),
        });
    }

    private ensureCanModifyTask(task: TaskEntity, caller: JwtPayload, actionName: string): void {
        if (caller.role === UserRole.VIEWER && task.createdById !== caller.sub && task.assignedToId !== caller.sub) {
            throw new ForbiddenException(`You can only ${actionName} your own or assigned tasks`);
        }
    }

    // ─── CRUD ────────────────────────────────────────────────────────────────

    async create(
        dto: CreateTaskDto,
        caller: JwtPayload,
        req?: Request,
    ): Promise<TaskEntity> {
        const task = this.taskRepo.create({
            ...dto,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            organizationId: caller.organizationId,
            createdById: caller.sub,
        });
        const saved = await this.taskRepo.save(task);

        await this.logTaskAudit('CREATE_TASK', saved.id, { title: saved.title, status: saved.status }, caller, req);

        return saved;
    }

    async findAll(
        caller: JwtPayload,
        filters?: {
            category?: TaskCategory;
            sortBy?: string;
            order?: 'ASC' | 'DESC' | 'asc' | 'desc';
        }
    ): Promise<TaskEntity[]> {

        // Build the where clause
        const whereClause: any = {};
        if (filters?.category) {
            whereClause.category = filters.category;
        }

        // Build the order clause
        const orderClause: any = {};
        if (filters?.sortBy) {
            const direction = filters.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            orderClause[filters.sortBy] = direction;
        } else {
            // Default sorting
            orderClause.order = 'ASC';
            orderClause.createdAt = 'DESC';
        }

        // OWNER / ADMIN see all tasks in their org AND any sub-orgs
        if (
            caller.role === UserRole.OWNER ||
            caller.role === UserRole.ADMIN
        ) {
            // Find any sub-orgs that belong to this organization
            const children = await this.orgRepo.find({
                where: { parentId: caller.organizationId },
            });
            const orgIds = [caller.organizationId, ...children.map(c => c.id)];

            whereClause.organizationId = In(orgIds);

            return this.taskRepo.find({
                where: whereClause,
                order: orderClause,
            });
        }

        // VIEWERs see their own tasks and tasks assigned to them
        return this.taskRepo.find({
            where: [
                { ...whereClause, organizationId: caller.organizationId, createdById: caller.sub },
                { ...whereClause, organizationId: caller.organizationId, assignedToId: caller.sub }
            ],
            order: orderClause,
        });
    }

    async findOne(id: string, caller: JwtPayload): Promise<TaskEntity> {
        const task = await this.taskRepo.findOne({
            where: { id, organizationId: caller.organizationId },
        });
        if (!task) throw new NotFoundException(`Task ${id} not found`);
        return task;
    }

    async update(
        id: string,
        dto: UpdateTaskDto,
        caller: JwtPayload,
        req?: Request,
    ): Promise<TaskEntity> {
        const task = await this.findOne(id, caller);

        this.ensureCanModifyTask(task, caller, 'edit');

        const before = { ...task };
        Object.assign(task, {
            ...dto,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : task.dueDate,
        });
        const saved = await this.taskRepo.save(task);

        await this.logTaskAudit('UPDATE_TASK', id, {
            before: { title: before.title, status: before.status },
            after: { title: saved.title, status: saved.status },
        }, caller, req);

        return saved;
    }

    async remove(
        id: string,
        caller: JwtPayload,
        req?: Request,
    ): Promise<{ deleted: true }> {
        const task = await this.findOne(id, caller);

        this.ensureCanModifyTask(task, caller, 'delete');

        await this.taskRepo.remove(task);

        await this.logTaskAudit('DELETE_TASK', id, { title: task.title }, caller, req);

        return { deleted: true };
    }
}
