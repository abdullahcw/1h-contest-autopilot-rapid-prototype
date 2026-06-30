import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlgCircleChartComponent } from './mlg-circle-chart.component';

describe('MlgCircleChartComponent', () => {
  let component: MlgCircleChartComponent;
  let fixture: ComponentFixture<MlgCircleChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MlgCircleChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MlgCircleChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
