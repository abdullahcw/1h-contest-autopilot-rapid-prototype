import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeDepartmentComponent } from './change-department.component';

describe('ChangeDepartmentComponent', () => {
  let component: ChangeDepartmentComponent;
  let fixture: ComponentFixture<ChangeDepartmentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeDepartmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
