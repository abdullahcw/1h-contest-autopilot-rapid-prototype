import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguagesSelectionDialogComponent } from './languages-selection-dialog.component';

describe('LanguagesSelectionDialogComponent', () => {
  let component: LanguagesSelectionDialogComponent;
  let fixture: ComponentFixture<LanguagesSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LanguagesSelectionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguagesSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
