import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaywallActionComponent } from './paywall-action.component';

describe('PaywallActionComponent', () => {
  let component: PaywallActionComponent;
  let fixture: ComponentFixture<PaywallActionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaywallActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaywallActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
