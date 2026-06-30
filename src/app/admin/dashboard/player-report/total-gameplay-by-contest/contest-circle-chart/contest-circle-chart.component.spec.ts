import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestCircleChartComponent } from './contest-circle-chart.component';

describe('ContestCircleChartComponent', () => {
  let component: ContestCircleChartComponent;
  let fixture: ComponentFixture<ContestCircleChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContestCircleChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestCircleChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
