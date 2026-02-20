import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFilterComponent } from './task-filter';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('TaskFilterComponent', () => {
  let component: TaskFilterComponent;
  let fixture: ComponentFixture<TaskFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFilterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TaskFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit filterChange when search input changes', () => {
    const emitSpy = vi.spyOn(component.filterChange, 'emit');

    const searchEvent = { target: { value: 'test search' } };
    component.onSearchChange(searchEvent as any);

    expect(emitSpy).toHaveBeenCalledWith({
      search: 'test search',
      category: ''
    });
  });

  it('should emit filterChange when category select changes', () => {
    const emitSpy = vi.spyOn(component.filterChange, 'emit');

    const categoryEvent = { target: { value: 'WORK' } };
    component.onCategoryChange(categoryEvent as any);

    expect(emitSpy).toHaveBeenCalledWith({
      search: '',
      category: 'WORK'
    });
  });
});
