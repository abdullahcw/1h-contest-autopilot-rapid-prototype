import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlayerGameReportComponent } from './player-game-report.component';

describe('PlayerGameReportComponent', () => {
  let component: PlayerGameReportComponent;
  let fixture: ComponentFixture<PlayerGameReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerGameReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerGameReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
