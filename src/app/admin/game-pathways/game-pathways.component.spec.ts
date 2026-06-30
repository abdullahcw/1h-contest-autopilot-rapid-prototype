import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePathwaysComponent } from './game-pathways.component';

describe('GamePathwaysComponent', () => {
  let component: GamePathwaysComponent;
  let fixture: ComponentFixture<GamePathwaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamePathwaysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamePathwaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
