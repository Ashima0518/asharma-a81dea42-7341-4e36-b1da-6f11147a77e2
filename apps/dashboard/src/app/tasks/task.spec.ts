import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from './task';

describe('TaskService', () => {
  let service: TaskService; // Changed type from Task to TaskService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TaskService // Provide the service being tested
      ]
    });
    service = TestBed.inject(TaskService); // Injected TaskService
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
