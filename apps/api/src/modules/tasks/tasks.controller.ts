import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@org/auth';
import type { JwtPayload } from '@org/data';
import { TaskCategory } from '@org/data';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

/**
 * POST   /tasks          – create a task
 * GET    /tasks          – list tasks (role-filtered)
 * GET    /tasks/:id      – get single task
 * PUT    /tasks/:id      – update a task (full update)
 * PATCH  /tasks/:id      – update a task (partial update)
 * DELETE /tasks/:id      – delete a task
 */
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create(@Body() dto: CreateTaskDto, @CurrentUser() user: JwtPayload, @Req() req: any) {
        return this.tasksService.create(dto, user, req);
    }

    @Get()
    findAll(
        @CurrentUser() user: JwtPayload,
        @Query('category') category?: TaskCategory,
        @Query('sortBy') sortBy?: string,
        @Query('order') order?: 'ASC' | 'DESC' | 'asc' | 'desc',
    ) {
        return this.tasksService.findAll(user, { category, sortBy, order });
    }

    @Get(':id')
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.tasksService.findOne(id, user);
    }

    @Put(':id')
    @Patch(':id')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: JwtPayload, @Req() req: any) {
        return this.tasksService.update(id, dto, user, req);
    }

    @Delete(':id')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload, @Req() req: any) {
        return this.tasksService.remove(id, user, req);
    }
}
