import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TaskBoardComponent } from './task-board';
import { TaskService } from './task';
import { Task } from '../models/task.model';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('TaskBoardComponent', () => {
  let component: TaskBoardComponent;
  let fixture: ComponentFixture<TaskBoardComponent>;
  let taskServiceSpy: any;

  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', description: 'Desc 1', status: 'TODO', organizationId: 'org1', creatorId: 'user1', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', title: 'Task 2', description: 'Desc 2', status: 'IN_PROGRESS', category: 'WORK', organizationId: 'org1', creatorId: 'user1', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', title: 'Task 3', description: 'Desc 3', status: 'DONE', category: 'PERSONAL', organizationId: 'org1', creatorId: 'user1', createdAt: new Date(), updatedAt: new Date() }
  ];

  beforeEach(async () => {
    taskServiceSpy = {
      getTasks: vi.fn(),
      updateTaskStatus: vi.fn(),
      deleteTask: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      tasks$: of(mockTasks)
    };
    taskServiceSpy.getTasks.mockReturnValue(of(mockTasks));

    await TestBed.configureTestingModule({
      imports: [TaskBoardComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TaskBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and group tasks by status on init', () => {
    expect(component).toBeTruthy();
    expect(component.todoTasks.length).toBe(1);
    expect(component.inProgressTasks.length).toBe(1);
    expect(component.doneTasks.length).toBe(1);
    expect(component.todoTasks[0].title).toBe('Task 1');
  });

  it('should filter tasks correctly', () => {
    component.onFilterChange({ search: 'Task 2', category: '' });
    expect(component.filteredTodoTasks.length).toBe(0);
    expect(component.filteredInProgressTasks.length).toBe(1);
    expect(component.filteredInProgressTasks[0].title).toBe('Task 2');
    expect(component.filteredDoneTasks.length).toBe(0);

    component.onFilterChange({ search: '', category: 'WORK' });
    expect(component.filteredInProgressTasks.length).toBe(1);
    expect(component.filteredDoneTasks.length).toBe(0);
  });
});
