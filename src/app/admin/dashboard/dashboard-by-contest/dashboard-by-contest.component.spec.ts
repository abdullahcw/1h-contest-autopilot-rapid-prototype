import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardByContestComponent } from './dashboard-by-contest.component';

describe('DashboardByContestComponent', () => {
  let component: DashboardByContestComponent;
  let fixture: ComponentFixture<DashboardByContestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardByContestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardByContestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
