import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContestNotificationComponent } from './contest-notification.component';

describe('ContestNotificationComponent', () => {
  let component: ContestNotificationComponent;
  let fixture: ComponentFixture<ContestNotificationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContestNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
