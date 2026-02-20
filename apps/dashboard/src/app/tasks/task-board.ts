import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from './task';
import { Task, TaskStatus } from '../models/task.model';
import { TaskFormComponent } from './task-form';
import { TaskFilterComponent } from './task-filter';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskFormComponent, TaskFilterComponent],
  template: `
    <div class="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm dark:bg-gray-800">
      <app-task-filter (filterChange)="onFilterChange($event)"></app-task-filter>
      <button (click)="openForm()" class="inline-flex items-center justify-center p-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="sr-only">Add task</span>
      </button>
    </div>

    <app-task-form 
      *ngIf="showForm" 
      [task]="editingTask" 
      (save)="onSaveTask($event)" 
      (cancel)="closeForm()">
    </app-task-form>

    <div class="flex flex-col md:flex-row gap-6 h-full items-start overflow-x-auto pb-4">
      
      <!-- To Do Column -->
      <div class="bg-gray-100 dark:bg-gray-800/80 rounded-xl w-full md:w-80 flex-shrink-0 flex flex-col max-h-full border border-gray-200 dark:border-gray-700">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 font-bold flex justify-between items-center">
          <span class="text-gray-700 dark:text-gray-300">To Do</span>
          <span class="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 py-1 px-2 rounded-full text-xs">{{todoTasks.length}}</span>
        </div>
        
        <div 
          id="todoList"
          class="p-4 overflow-y-auto flex-1 min-h-[150px]"
          cdkDropList
          [cdkDropListData]="filteredTodoTasks"
          [cdkDropListConnectedTo]="['inProgressList', 'doneList']"
          (cdkDropListDropped)="drop($event, 'TODO')">
          
          <div *ngFor="let task of filteredTodoTasks" cdkDrag [cdkDragData]="task" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-3 cursor-move hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <span *ngIf="task.category" 
                class="text-xs font-medium px-2 py-1 rounded-full dark:bg-opacity-30"
                [ngClass]="{
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': task.category === 'WORK',
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300': task.category === 'PERSONAL',
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': task.category === 'URGENT',
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': task.category === 'OTHER'
                }">
                {{task.category}}
              </span>
              <button (click)="editTask(task)" class="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{task.title}}</h4>
            <div class="flex justify-between items-center mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{task.description}}</p>
              <button (click)="deleteTask(task.id)" class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="bg-gray-100 dark:bg-gray-800/80 rounded-xl w-full md:w-80 flex-shrink-0 flex flex-col max-h-full border border-gray-200 dark:border-gray-700">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 font-bold flex justify-between items-center">
          <span class="text-blue-600 dark:text-blue-400">In Progress</span>
          <span class="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 py-1 px-2 rounded-full text-xs">{{inProgressTasks.length}}</span>
        </div>
        
        <div 
          id="inProgressList"
          class="p-4 overflow-y-auto flex-1 min-h-[150px]"
          cdkDropList
          [cdkDropListData]="filteredInProgressTasks"
          [cdkDropListConnectedTo]="['todoList', 'doneList']"
          (cdkDropListDropped)="drop($event, 'IN_PROGRESS')">
          
          <div *ngFor="let task of filteredInProgressTasks" cdkDrag [cdkDragData]="task" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-3 cursor-move hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <div class="flex justify-between items-start mb-2">
              <span *ngIf="task.category" 
                class="text-xs font-medium px-2 py-1 rounded-full dark:bg-opacity-30"
                [ngClass]="{
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': task.category === 'WORK',
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300': task.category === 'PERSONAL',
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': task.category === 'URGENT',
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': task.category === 'OTHER'
                }">
                {{task.category}}
              </span>
              <button (click)="editTask(task)" class="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{task.title}}</h4>
            <div class="flex justify-between items-center mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{task.description}}</p>
              <button (click)="deleteTask(task.id)" class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Done Column -->
      <div class="bg-gray-100 dark:bg-gray-800/80 rounded-xl w-full md:w-80 flex-shrink-0 flex flex-col max-h-full border border-gray-200 dark:border-gray-700">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 font-bold flex justify-between items-center">
          <span class="text-green-600 dark:text-green-400">Done</span>
          <span class="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 py-1 px-2 rounded-full text-xs">{{doneTasks.length}}</span>
        </div>
        
        <div 
          id="doneList"
          class="p-4 overflow-y-auto flex-1 min-h-[150px]"
          cdkDropList
          [cdkDropListData]="filteredDoneTasks"
          [cdkDropListConnectedTo]="['todoList', 'inProgressList']"
          (cdkDropListDropped)="drop($event, 'DONE')">
          
          <div *ngFor="let task of filteredDoneTasks" cdkDrag [cdkDragData]="task" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-3 cursor-move hover:shadow-md transition-shadow opacity-75 border-l-4 border-l-green-500">
            <div class="flex justify-between items-start mb-2">
              <span *ngIf="task.category" 
                class="text-xs font-medium px-2 py-1 rounded-full text-opacity-75 dark:bg-opacity-30"
                [ngClass]="{
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': task.category === 'WORK',
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300': task.category === 'PERSONAL',
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': task.category === 'URGENT',
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': task.category === 'OTHER'
                }">
                {{task.category}}
              </span>
              <button (click)="editTask(task)" class="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1 line-through">{{task.title}}</h4>
            <div class="flex justify-between items-center mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{task.description}}</p>
              <button (click)="deleteTask(task.id)" class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  `
})
export class TaskBoardComponent implements OnInit {
  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);

  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  filteredTodoTasks: Task[] = [];
  filteredInProgressTasks: Task[] = [];
  filteredDoneTasks: Task[] = [];

  showForm = false;
  editingTask: Task | null = null;
  currentFilter = { search: '', category: '' };

  ngOnInit() {
    this.taskService.tasks$.subscribe(tasks => {
      this.todoTasks = tasks.filter(t => t.status === 'TODO');
      this.inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
      this.doneTasks = tasks.filter(t => t.status === 'DONE');
      this.applyFilters();
      this.cdr.detectChanges();
    });

    // Fetch initial tasks
    this.taskService.getTasks().subscribe();
  }

  onFilterChange(filters: { search: string, category: string }) {
    this.currentFilter = filters;
    this.applyFilters();
  }

  private applyFilters() {
    const { search, category } = this.currentFilter;
    const filterFn = (task: Task) => {
      const matchSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !category || task.category === category;
      return matchSearch && matchCategory;
    };

    this.filteredTodoTasks = this.todoTasks.filter(filterFn);
    this.filteredInProgressTasks = this.inProgressTasks.filter(filterFn);
    this.filteredDoneTasks = this.doneTasks.filter(filterFn);
  }

  openForm() {
    this.editingTask = null;
    this.showForm = true;
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingTask = null;
  }

  onSaveTask(taskData: Partial<Task>) {
    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, taskData).subscribe({
        next: () => {
          this.closeForm();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error updating task', err)
      });
    } else {
      this.taskService.createTask({ ...taskData, status: 'TODO' }).subscribe({
        next: () => {
          this.closeForm();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error creating task', err)
      });
    }
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => this.cdr.detectChanges()
      });
    }
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const task = event.item.data as Task;
      this.taskService.updateTaskStatus(task.id, newStatus).subscribe();
    }
  }
}
