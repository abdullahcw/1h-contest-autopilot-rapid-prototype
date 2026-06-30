import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlgGamePlayReportDialogComponent } from './mlg-game-play-report-dialog.component';

describe('MlgGamePlayReportDialogComponent', () => {
  let component: MlgGamePlayReportDialogComponent;
  let fixture: ComponentFixture<MlgGamePlayReportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MlgGamePlayReportDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MlgGamePlayReportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
