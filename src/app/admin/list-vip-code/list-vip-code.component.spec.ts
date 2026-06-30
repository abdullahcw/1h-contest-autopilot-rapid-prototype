import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListVipCodeComponent } from './list-vip-code.component';

describe('ListVipCodeComponent', () => {
  let component: ListVipCodeComponent;
  let fixture: ComponentFixture<ListVipCodeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListVipCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListVipCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
