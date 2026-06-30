import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScheduleGameComponent } from './schedule-game.component';

describe('ScheduleGameComponent', () => {
  let component: ScheduleGameComponent;
  let fixture: ComponentFixture<ScheduleGameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
