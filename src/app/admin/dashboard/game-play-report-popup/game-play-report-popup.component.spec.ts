import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePlayReportPopupComponent } from './game-play-report-popup.component';

describe('GamePlayReportPopupComponent', () => {
  let component: GamePlayReportPopupComponent;
  let fixture: ComponentFixture<GamePlayReportPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamePlayReportPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamePlayReportPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
