import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskChartComponent } from './task-chart';

describe('TaskChartComponent', () => {
  let component: TaskChartComponent;
  let fixture: ComponentFixture<TaskChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
