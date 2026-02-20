import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-2">
      <div class="relative rounded-md shadow-sm w-full sm:w-64">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input 
          type="text" 
          (input)="onSearchChange($event)"
          class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
          placeholder="Search by title...">
      </div>
      
      <select 
        (change)="onCategoryChange($event)"
        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-auto sm:text-sm border-gray-300 rounded-md py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <option value="">All Categories</option>
        <option value="WORK">Work</option>
        <option value="PERSONAL">Personal</option>
        <option value="URGENT">Urgent</option>
        <option value="OTHER">Other</option>
      </select>
    </div>
  `
})
export class TaskFilterComponent {
  @Output() filterChange = new EventEmitter<{ search: string, category: string }>();

  private filters = { search: '', category: '' };

  onSearchChange(event: any) {
    this.filters.search = event.target.value;
    this.filterChange.emit(this.filters);
  }

  onCategoryChange(event: any) {
    this.filters.category = event.target.value;
    this.filterChange.emit(this.filters);
  }
}
