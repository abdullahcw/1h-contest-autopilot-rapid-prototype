import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyQRCodeComponent } from './company-qrcode.component';

describe('CompanyQRCodeComponent', () => {
  let component: CompanyQRCodeComponent;
  let fixture: ComponentFixture<CompanyQRCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyQRCodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyQRCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
