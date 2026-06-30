import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MultiselectEditableInputComponent } from './multiselect-editable-input.component';

describe('MultiselectEditableInputComponent', () => {
  let component: MultiselectEditableInputComponent;
  let fixture: ComponentFixture<MultiselectEditableInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiselectEditableInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiselectEditableInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
