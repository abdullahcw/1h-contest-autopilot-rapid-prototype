import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBySlgComponent } from './dashboard-by-slg.component';

describe('DashboardBySlgComponent', () => {
  let component: DashboardBySlgComponent;
  let fixture: ComponentFixture<DashboardBySlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardBySlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardBySlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
