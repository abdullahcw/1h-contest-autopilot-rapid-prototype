import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerAchivementsComponent } from './player-achivements.component';

describe('PlayerAchivementsComponent', () => {
  let component: PlayerAchivementsComponent;
  let fixture: ComponentFixture<PlayerAchivementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerAchivementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerAchivementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
