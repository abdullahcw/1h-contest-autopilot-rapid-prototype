import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameProgressDialogComponent } from './game-progress-dialog.component';

describe('GameProgressDialogComponent', () => {
  let component: GameProgressDialogComponent;
  let fixture: ComponentFixture<GameProgressDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameProgressDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
