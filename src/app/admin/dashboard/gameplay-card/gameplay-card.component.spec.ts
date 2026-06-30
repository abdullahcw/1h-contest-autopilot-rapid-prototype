import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GameplayCardComponent } from './gameplay-card.component';

describe('GameplayCardComponent', () => {
  let component: GameplayCardComponent;
  let fixture: ComponentFixture<GameplayCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameplayCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameplayCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
