import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlayerFeedbackComponent } from './player-feedback.component';

describe('PlayerFeedbackComponent', () => {
  let component: PlayerFeedbackComponent;
  let fixture: ComponentFixture<PlayerFeedbackComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
