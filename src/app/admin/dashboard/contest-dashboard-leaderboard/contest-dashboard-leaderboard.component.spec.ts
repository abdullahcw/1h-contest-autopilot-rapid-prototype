import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestDashboardLeaderboardComponent } from './contest-dashboard-leaderboard.component';

describe('ContestDashboardLeaderboardComponent', () => {
  let component: ContestDashboardLeaderboardComponent;
  let fixture: ComponentFixture<ContestDashboardLeaderboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContestDashboardLeaderboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestDashboardLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
