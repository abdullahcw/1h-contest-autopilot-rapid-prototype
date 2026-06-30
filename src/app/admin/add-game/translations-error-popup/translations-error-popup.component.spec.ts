import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationsErrorPopupComponent } from './translations-error-popup.component';

describe('TranslationsErrorPopupComponent', () => {
  let component: TranslationsErrorPopupComponent;
  let fixture: ComponentFixture<TranslationsErrorPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TranslationsErrorPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TranslationsErrorPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
