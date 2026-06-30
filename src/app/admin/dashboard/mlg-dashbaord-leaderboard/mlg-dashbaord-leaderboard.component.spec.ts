import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlgDashbaordLeaderboardComponent } from './mlg-dashbaord-leaderboard.component';

describe('MlgDashbaordLeaderboardComponent', () => {
  let component: MlgDashbaordLeaderboardComponent;
  let fixture: ComponentFixture<MlgDashbaordLeaderboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MlgDashbaordLeaderboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MlgDashbaordLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
