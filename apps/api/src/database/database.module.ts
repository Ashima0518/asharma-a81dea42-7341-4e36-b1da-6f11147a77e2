import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { OrganizationEntity } from './entities/organization.entity';
import { TaskEntity } from './entities/task.entity';
import { UserEntity } from './entities/user.entity';


@Module({
    imports: [TypeOrmModule.forFeature([OrganizationEntity, UserEntity, TaskEntity, AuditLogEntity])],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }
