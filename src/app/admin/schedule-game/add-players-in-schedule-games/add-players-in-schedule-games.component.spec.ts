import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddPlayersInScheduleGamesComponent } from './add-players-in-schedule-games.component';

describe('AddPlayersInScheduleGamesComponent', () => {
  let component: AddPlayersInScheduleGamesComponent;
  let fixture: ComponentFixture<AddPlayersInScheduleGamesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPlayersInScheduleGamesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPlayersInScheduleGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
