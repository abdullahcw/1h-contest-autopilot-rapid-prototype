import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelfServiceRegistrationComponent } from './self-service-registration.component';

describe('SelfServiceRegistrationComponent', () => {
  let component: SelfServiceRegistrationComponent;
  let fixture: ComponentFixture<SelfServiceRegistrationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelfServiceRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfServiceRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
