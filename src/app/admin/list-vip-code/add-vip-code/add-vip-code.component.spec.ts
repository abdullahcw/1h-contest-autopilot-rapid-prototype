import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddVipCodeComponent } from './add-vip-code.component';

describe('AddVipCodeComponent', () => {
  let component: AddVipCodeComponent;
  let fixture: ComponentFixture<AddVipCodeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddVipCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVipCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
