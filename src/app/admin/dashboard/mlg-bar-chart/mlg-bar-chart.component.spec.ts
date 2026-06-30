import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlgBarChartComponent } from './mlg-bar-chart.component';

describe('MlgBarChartComponent', () => {
  let component: MlgBarChartComponent;
  let fixture: ComponentFixture<MlgBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MlgBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MlgBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
