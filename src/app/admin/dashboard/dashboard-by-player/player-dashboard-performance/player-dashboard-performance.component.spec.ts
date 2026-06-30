import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerDashboardPerformanceComponent } from './player-dashboard-performance.component';

describe('PlayerDashboardPerformanceComponent', () => {
  let component: PlayerDashboardPerformanceComponent;
  let fixture: ComponentFixture<PlayerDashboardPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerDashboardPerformanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerDashboardPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
