import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlayersInAudienceComponent } from './players-in-audience.component';

describe('AddPlayersInAudienceComponent', () => {
  let component: PlayersInAudienceComponent;
  let fixture: ComponentFixture<PlayersInAudienceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayersInAudienceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayersInAudienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
