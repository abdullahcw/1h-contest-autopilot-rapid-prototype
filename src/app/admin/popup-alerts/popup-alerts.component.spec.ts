import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAlertsComponent } from './popup-alerts.component';

describe('PopupAlertsComponent', () => {
  let component: PopupAlertsComponent;
  let fixture: ComponentFixture<PopupAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAlertsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
