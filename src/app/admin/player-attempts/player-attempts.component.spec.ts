import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlayerAttemptsComponent } from './player-attempts.component';

describe('PlayerAttemptsComponent', () => {
  let component: PlayerAttemptsComponent;
  let fixture: ComponentFixture<PlayerAttemptsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerAttemptsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerAttemptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
