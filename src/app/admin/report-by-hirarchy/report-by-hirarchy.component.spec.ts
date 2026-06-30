import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportByHirarchyComponent } from './report-by-hirarchy.component';

describe('ReportByHirarchyComponent', () => {
  let component: ReportByHirarchyComponent;
  let fixture: ComponentFixture<ReportByHirarchyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportByHirarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportByHirarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
