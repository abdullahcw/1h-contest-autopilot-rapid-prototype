import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlayerReportComponent } from './player-report.component';

describe('PlayerReportComponent', () => {
  let component: PlayerReportComponent;
  let fixture: ComponentFixture<PlayerReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
