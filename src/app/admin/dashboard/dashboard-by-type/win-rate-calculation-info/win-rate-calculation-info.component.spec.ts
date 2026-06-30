import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinRateCalculationInfoComponent } from './win-rate-calculation-info.component';

describe('WinRateCalculationInfoComponent', () => {
  let component: WinRateCalculationInfoComponent;
  let fixture: ComponentFixture<WinRateCalculationInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WinRateCalculationInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WinRateCalculationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
