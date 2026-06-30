import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TrophyReportComponent } from './trophy-report.component';

describe('TrophyReportComponent', () => {
  let component: TrophyReportComponent;
  let fixture: ComponentFixture<TrophyReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TrophyReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrophyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
