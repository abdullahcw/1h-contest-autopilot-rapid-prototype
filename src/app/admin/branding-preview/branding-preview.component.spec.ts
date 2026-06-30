import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BrandingPreviewComponent } from './branding-preview.component';

describe('BrandingPreviewComponent', () => {
  let component: BrandingPreviewComponent;
  let fixture: ComponentFixture<BrandingPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BrandingPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandingPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
