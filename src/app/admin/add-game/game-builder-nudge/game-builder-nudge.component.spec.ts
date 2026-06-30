import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBuilderNudgeComponent } from './game-builder-nudge.component';

describe('GameBuilderNudgeComponent', () => {
  let component: GameBuilderNudgeComponent;
  let fixture: ComponentFixture<GameBuilderNudgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameBuilderNudgeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameBuilderNudgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
