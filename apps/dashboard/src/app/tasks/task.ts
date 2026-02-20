import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>('/api/tasks').pipe(
      tap(tasks => this.tasksSubject.next(tasks))
    );
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>('/api/users');
  }

  createTask(taskData: Partial<Task>): Observable<Task> {
    return this.http.post<Task>('/api/tasks', taskData).pipe(
      tap(newTask => {
        const currentTasks = this.tasksSubject.getValue();
        this.tasksSubject.next([...currentTasks, newTask]);
      })
    );
  }

  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`/api/tasks/${id}`, updates).pipe(
      tap(updatedTask => {
        const currentTasks = this.tasksSubject.getValue();
        const updatedTasks = currentTasks.map(t => t.id === id ? { ...t, ...updatedTask } : t);
        this.tasksSubject.next(updatedTasks);
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`/api/tasks/${id}`).pipe(
      tap(() => {
        const currentTasks = this.tasksSubject.getValue();
        this.tasksSubject.next(currentTasks.filter(t => t.id !== id));
      })
    );
  }

  updateTaskStatus(id: string, newStatus: TaskStatus): Observable<Task> {
    return this.updateTask(id, { status: newStatus });
  }
}
