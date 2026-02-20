import { Component, EventEmitter, Input, Output, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../models/task.model';
import { TaskService } from './task';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center dark:bg-gray-900/80 transition-opacity">
      <div class="relative w-full max-w-md p-6 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl rounded-xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ task ? 'Edit Task' : 'New Task' }}
          </h3>
          <button (click)="cancel.emit()" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input type="text" id="title" formControlName="title" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea id="description" formControlName="description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
          </div>

          <div class="flex space-x-4">
            <div class="flex-1">
              <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select id="category" formControlName="category" class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="WORK">Work</option>
                <option value="PERSONAL">Personal</option>
                <option value="URGENT">Urgent</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div class="flex-1" *ngIf="availableUsers.length > 0">
              <label for="assignedToId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
              <select id="assignedToId" formControlName="assignedToId" class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option [ngValue]="null">Unassigned</option>
                <option *ngFor="let user of availableUsers" [value]="user.id">{{ user.name }} ({{ user.role }})</option>
              </select>
            </div>
          </div>

          <div class="pt-4 flex justify-end space-x-3">
            <button type="button" (click)="cancel.emit()" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
              Cancel
            </button>
            <button type="submit" [disabled]="taskForm.invalid" class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<Partial<Task>>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);

  availableUsers: any[] = [];

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    category: ['WORK'],
    assignedToId: [null as string | null]
  });

  ngOnInit() {
    // Attempt to load users for the assignee dropdown
    this.taskService.getUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Silently ignore 403 Forbidden errors since VIEWER roles are not supposed to fetch users
        if (err.status !== 403) {
          console.error('Failed to load users for assignee dropdown:', err);
        }
        this.availableUsers = [];
        this.cdr.detectChanges();
      }
    });

    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        category: this.task.category || 'WORK',
        assignedToId: this.task.assignedToId || null
      });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.save.emit(this.taskForm.value as Partial<Task>);
    }
  }
}
