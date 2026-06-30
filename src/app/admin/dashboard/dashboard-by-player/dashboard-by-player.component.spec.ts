import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardByPlayerComponent } from './dashboard-by-player.component';

describe('DashboardByPlayerComponent', () => {
  let component: DashboardByPlayerComponent;
  let fixture: ComponentFixture<DashboardByPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardByPlayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardByPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
