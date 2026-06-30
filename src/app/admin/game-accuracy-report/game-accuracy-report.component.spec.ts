import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GameAccuracyReportComponent } from './game-accuracy-report.component';

describe('GameAccuracyReportComponent', () => {
  let component: GameAccuracyReportComponent;
  let fixture: ComponentFixture<GameAccuracyReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameAccuracyReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameAccuracyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
