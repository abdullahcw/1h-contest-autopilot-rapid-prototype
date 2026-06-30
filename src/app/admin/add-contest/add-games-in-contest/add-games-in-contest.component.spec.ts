import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddGamesInContestComponent } from './add-games-in-contest.component';

describe('AddGamesInContestComponent', () => {
  let component: AddGamesInContestComponent;
  let fixture: ComponentFixture<AddGamesInContestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGamesInContestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGamesInContestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
