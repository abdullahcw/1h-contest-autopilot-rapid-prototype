import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScheduleMultilevelGamesComponent } from './schedule-multilevel-games.component';

describe('ScheduleMultilevelGamesComponent', () => {
  let component: ScheduleMultilevelGamesComponent;
  let fixture: ComponentFixture<ScheduleMultilevelGamesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleMultilevelGamesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleMultilevelGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
