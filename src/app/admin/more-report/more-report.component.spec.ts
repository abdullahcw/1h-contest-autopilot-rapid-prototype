import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MoreReportComponent } from './more-report.component';

describe('MoreReportComponent', () => {
  let component: MoreReportComponent;
  let fixture: ComponentFixture<MoreReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MoreReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
