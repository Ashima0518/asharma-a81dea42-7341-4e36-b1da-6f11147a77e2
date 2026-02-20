import { Component, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth';
import { TaskBoardComponent } from '../tasks/task-board';
import { TaskChartComponent } from '../tasks/task-chart';
import { TaskFormComponent } from '../tasks/task-form';
import { TaskService } from '../tasks/task';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TaskBoardComponent, TaskChartComponent, TaskFormComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      
      <!-- Top Navigation -->
      <nav class="bg-white shadow-sm dark:bg-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <h1 class="text-xl font-bold text-indigo-600 dark:text-indigo-400">TaskFlow</h1>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <button (click)="toggleDarkMode()" class="p-2 text-gray-400 hover:text-gray-500 focus:outline-none dark:hover:text-gray-300 transition-colors">
                <span class="sr-only">Toggle dark mode</span>
                <svg *ngIf="!isDarkMode" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg *ngIf="isDarkMode" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              
              <div class="relative">
                <button (click)="logout()" class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        
        <!-- Dashboard Header & Chart -->
        <div class="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm dark:bg-gray-800 flex flex-col justify-center">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">Here's an overview of your team's progress. Use shortcut <kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm text-gray-800 dark:text-gray-200 font-mono">n</kbd> to create a new task quickly.</p>
            <div class="flex space-x-4">
              <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg flex-1">
                <span class="block text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Tasks</span>
                <span class="block text-2xl font-bold text-gray-900 dark:text-white">{{totalTasks}}</span>
              </div>
              <div class="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg flex-1">
                <span class="block text-sm font-medium text-green-600 dark:text-green-400">Completed</span>
                <span class="block text-2xl font-bold text-gray-900 dark:text-white">{{completedTasks}}</span>
              </div>
            </div>
          </div>
          <div class="lg:col-span-1">
            <app-task-chart></app-task-chart>
          </div>
        </div>

        <app-task-form 
          *ngIf="showForm" 
          (save)="onSaveTask($event)" 
          (cancel)="closeForm()">
        </app-task-form>
          
        <app-task-board />
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isDarkMode = false;
  showForm = false;
  totalTasks = 0;
  completedTasks = 0;

  ngOnInit() {
    // Check initial dark mode preference
    this.isDarkMode = localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.applyTheme();

    this.taskService.tasks$.subscribe(tasks => {
      this.totalTasks = tasks.length;
      this.completedTasks = tasks.filter(t => t.status === 'DONE').length;
      this.cdr.detectChanges();
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Prevent triggering 'n' shortcut when typing in inputs/textareas
    const activeEl = document.activeElement as HTMLElement;
    const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT';

    if (event.key.toLowerCase() === 'n' && !isInput && !this.showForm) {
      event.preventDefault();
      this.openForm();
    }

    if (event.key === 'Escape' && this.showForm) {
      this.closeForm();
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  openForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  onSaveTask(taskData: Partial<Task>) {
    this.taskService.createTask({ ...taskData, status: 'TODO' }).subscribe(() => {
      this.closeForm();
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
