import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { OrganizationEntity } from './organization.entity.js';
import { UserEntity } from './user.entity.js';
import { TaskStatus } from './enum.js';

@Entity('tasks')
export class TaskEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({
        type: 'text',
        default: TaskStatus.TODO,
    })
    status!: TaskStatus;

    @Column({ nullable: true })
    category?: string; // e.g., 'Work', 'Personal'

    @Column({ type: 'int', default: 0 })
    order!: number; // for drag-and-drop ordering

    @Column({ type: 'datetime', nullable: true })
    dueDate?: Date;

    @Column('uuid')
    organizationId!: string;

    @ManyToOne(() => OrganizationEntity, (org) => org.tasks, {
        onDelete: 'CASCADE',
    })
    organization!: OrganizationEntity;

    @Column('uuid', { nullable: true })
    assignedToId?: string;

    @ManyToOne(() => UserEntity, (user) => user.assignedTasks, {
        onDelete: 'SET NULL',
    })
    assignedTo?: UserEntity;

    @Column('uuid')
    createdById!: string;

    @ManyToOne(() => UserEntity, (user) => user.createdTasks, {
        onDelete: 'CASCADE',
    })
    createdBy!: UserEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
