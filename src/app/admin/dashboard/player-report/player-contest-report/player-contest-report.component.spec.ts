import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerContestReportComponent } from './player-contest-report.component';

describe('PlayerContestReportComponent', () => {
  let component: PlayerContestReportComponent;
  let fixture: ComponentFixture<PlayerContestReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerContestReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerContestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
