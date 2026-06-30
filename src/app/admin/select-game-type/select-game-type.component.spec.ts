import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectGameTypeComponent } from './select-game-type.component';

describe('SelectGameTypeComponent', () => {
  let component: SelectGameTypeComponent;
  let fixture: ComponentFixture<SelectGameTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectGameTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectGameTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
