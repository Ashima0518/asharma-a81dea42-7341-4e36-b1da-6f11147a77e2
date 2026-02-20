import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../modules/auth/auth.module.js';
import { TasksModule } from '../modules/tasks/tasks.module.js';
import { AuditModule } from '../modules/audit/audit.module.js';
import { OrgsModule } from '../modules/orgs/orgs.module.js';
import { UsersModule } from '../modules/users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<'sqlite'>('DB_TYPE', 'sqlite'),
        database: config.get<string>('DB_DATABASE', 'task.db'),
        autoLoadEntities: true,
        synchronize: true, // OK for now; later we'll switch to migrations
      }),
    }),
    AuthModule,
    TasksModule,
    AuditModule,
    OrgsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
