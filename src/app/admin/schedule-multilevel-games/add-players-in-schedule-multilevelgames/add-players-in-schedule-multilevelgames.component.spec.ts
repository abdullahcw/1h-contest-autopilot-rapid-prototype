import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddPlayersInScheduleMultilevelgamesComponent } from './add-players-in-schedule-multilevelgames.component';

describe('AddPlayersInScheduleMultilevelgamesComponent', () => {
  let component: AddPlayersInScheduleMultilevelgamesComponent;
  let fixture: ComponentFixture<AddPlayersInScheduleMultilevelgamesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPlayersInScheduleMultilevelgamesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPlayersInScheduleMultilevelgamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
