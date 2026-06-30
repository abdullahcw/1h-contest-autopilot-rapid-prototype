import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardByMlgComponent } from './dashboard-by-mlg.component';

describe('DashboardByMlgComponent', () => {
  let component: DashboardByMlgComponent;
  let fixture: ComponentFixture<DashboardByMlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardByMlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardByMlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
