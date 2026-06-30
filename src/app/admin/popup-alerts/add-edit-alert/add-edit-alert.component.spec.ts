import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAlertComponent } from './add-edit-alert.component';

describe('AddEditAlertComponent', () => {
  let component: AddEditAlertComponent;
  let fixture: ComponentFixture<AddEditAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditAlertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
