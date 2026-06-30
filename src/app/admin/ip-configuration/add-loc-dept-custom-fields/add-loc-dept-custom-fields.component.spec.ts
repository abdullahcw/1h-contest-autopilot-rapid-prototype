import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLocDeptCustomFieldsComponent } from './add-loc-dept-custom-fields.component';

describe('AddLocDeptCustomFieldsComponent', () => {
  let component: AddLocDeptCustomFieldsComponent;
  let fixture: ComponentFixture<AddLocDeptCustomFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLocDeptCustomFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLocDeptCustomFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
