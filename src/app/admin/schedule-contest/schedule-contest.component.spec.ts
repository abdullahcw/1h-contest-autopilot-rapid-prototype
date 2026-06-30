import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScheduleContestComponent } from './schedule-contest.component';

describe('ScheduleContestComponent', () => {
  let component: ScheduleContestComponent;
  let fixture: ComponentFixture<ScheduleContestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleContestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleContestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
