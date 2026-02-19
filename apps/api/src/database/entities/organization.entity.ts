import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity.js';
import { TaskEntity } from './task.entity.js';
import { AuditLogEntity } from './audit-log.entity.js';

/**
 * OrganizationEntity
 * Represents a company or team workspace
 */
@Entity('organizations')
export class OrganizationEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    name!: string;

    // Relationships
    @OneToMany(() => UserEntity, (user) => user.organization, {
        cascade: true,
    })
    users!: UserEntity[];

    @OneToMany(() => TaskEntity, (task) => task.organization, {
        cascade: true,
    })
    tasks!: TaskEntity[];

    @OneToMany(() => AuditLogEntity, (auditLog) => auditLog.organization, {
        cascade: true,
    })
    auditLogs!: AuditLogEntity[];
}
