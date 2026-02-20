import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TaskService } from './task';

@Component({
  selector: 'app-task-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Task Completion</h3>
      <div class="h-64 w-full">
        <canvas baseChart
          [data]="barChartData"
          [options]="barChartOptions"
          [type]="'bar'">
        </canvas>
      </div>
    </div>
  `
})
export class TaskChartComponent implements OnInit {
  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)', // gray
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(16, 185, 129, 0.8)'  // green
        ],
        borderRadius: 4
      }
    ]
  };

  ngOnInit() {
    this.taskService.tasks$.subscribe(tasks => {
      const todo = tasks.filter(t => t.status === 'TODO').length;
      const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const done = tasks.filter(t => t.status === 'DONE').length;

      this.barChartData = {
        labels: ['To Do', 'In Progress', 'Done'],
        datasets: [
          {
            data: [todo, inProgress, done],
            backgroundColor: [
              'rgba(156, 163, 175, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)'
            ],
            borderRadius: 4
          }
        ]
      };
      this.cdr.detectChanges();
    });
  }
}
