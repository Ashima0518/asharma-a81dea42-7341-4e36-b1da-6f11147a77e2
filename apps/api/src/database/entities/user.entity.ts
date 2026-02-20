import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { OrganizationEntity } from './organization.entity.js';
import { TaskEntity } from './task.entity.js';
import { UserRole } from '@org/data';
import { AuditLogEntity } from './audit-log.entity.js';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string; // hashed

    @Column()
    name!: string;

    @Column({
        type: 'text',
        default: UserRole.VIEWER,
    })
    role!: UserRole;

    @Column('uuid')
    organizationId!: string;

    @ManyToOne(() => OrganizationEntity, (org) => org.users, {
        onDelete: 'CASCADE',
    })
    organization!: OrganizationEntity;

    @OneToMany(() => TaskEntity, (task) => task.assignedTo)
    assignedTasks!: TaskEntity[];

    @OneToMany(() => TaskEntity, (task) => task.createdBy)
    createdTasks!: TaskEntity[];

    @OneToMany(() => AuditLogEntity, (log) => log.user)
    auditLogs!: AuditLogEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
