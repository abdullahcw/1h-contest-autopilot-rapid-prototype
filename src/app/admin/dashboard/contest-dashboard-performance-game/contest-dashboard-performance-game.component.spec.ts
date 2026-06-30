import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestDashboardPerformanceGameComponent } from './contest-dashboard-performance-game.component';

describe('ContestDashboardPerformanceGameComponent', () => {
  let component: ContestDashboardPerformanceGameComponent;
  let fixture: ComponentFixture<ContestDashboardPerformanceGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContestDashboardPerformanceGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestDashboardPerformanceGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
