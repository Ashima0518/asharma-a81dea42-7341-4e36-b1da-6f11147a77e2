import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity.js';
import { OrganizationEntity } from './organization.entity.js';

@Entity('audit_logs')
export class AuditLogEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    action!: string; // e.g., 'CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'LOGIN', 'UNAUTHORIZED_ACCESS'

    @Column()
    resource!: string; // e.g., 'Task', 'User', 'Organization'

    @Column({ nullable: true })
    resourceId?: string; // ID of the affected resource

    @Column({ type: 'text', nullable: true })
    details?: string; // JSON stringified additional context

    @Column({ nullable: true })
    ipAddress?: string;

    @Column({ nullable: true })
    userAgent?: string;

    @Column('uuid', { nullable: true })
    userId?: string;

    @ManyToOne(() => UserEntity, (user) => user.auditLogs, {
        onDelete: 'SET NULL',
    })
    user?: UserEntity;

    @Column('uuid')
    organizationId!: string;

    @ManyToOne(() => OrganizationEntity, {
        onDelete: 'CASCADE',
    })
    organization!: OrganizationEntity;

    @CreateDateColumn()
    createdAt!: Date;
}
