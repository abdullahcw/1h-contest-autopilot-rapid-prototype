import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplayByDateComponent } from './gameplay-by-date.component';

describe('GameplayByDateComponent', () => {
  let component: GameplayByDateComponent;
  let fixture: ComponentFixture<GameplayByDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameplayByDateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameplayByDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
