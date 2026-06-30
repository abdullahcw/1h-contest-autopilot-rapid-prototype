import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlgDashbaordPerformanceLevelComponent } from './mlg-dashbaord-performance-level.component';

describe('MlgDashbaordPerformanceLevelComponent', () => {
  let component: MlgDashbaordPerformanceLevelComponent;
  let fixture: ComponentFixture<MlgDashbaordPerformanceLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MlgDashbaordPerformanceLevelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MlgDashbaordPerformanceLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
