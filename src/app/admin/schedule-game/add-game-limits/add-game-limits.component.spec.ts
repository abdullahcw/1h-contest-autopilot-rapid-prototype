import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddGameLimitsComponent } from './add-game-limits.component';

describe('AddGameLimitsComponent', () => {
  let component: AddGameLimitsComponent;
  let fixture: ComponentFixture<AddGameLimitsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGameLimitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGameLimitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
