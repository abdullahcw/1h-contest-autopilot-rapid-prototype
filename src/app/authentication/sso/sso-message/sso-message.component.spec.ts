import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SsoMessageComponent } from './sso-message.component';

describe('SsoMessageComponent', () => {
  let component: SsoMessageComponent;
  let fixture: ComponentFixture<SsoMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SsoMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsoMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
