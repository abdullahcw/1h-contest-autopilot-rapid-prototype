import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GameIconPickerComponent } from './game-icon-picker.component';

describe('GameIconPickerComponent', () => {
  let component: GameIconPickerComponent;
  let fixture: ComponentFixture<GameIconPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameIconPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameIconPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
