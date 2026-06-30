import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopReportComponent } from './shop-report.component';

describe('ShopReportComponent', () => {
  let component: ShopReportComponent;
  let fixture: ComponentFixture<ShopReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShopReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
