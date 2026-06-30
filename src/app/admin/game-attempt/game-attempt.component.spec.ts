import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GameAttemptComponent } from './game-attempt.component';

describe('GameAttemptComponent', () => {
  let component: GameAttemptComponent;
  let fixture: ComponentFixture<GameAttemptComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameAttemptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameAttemptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
