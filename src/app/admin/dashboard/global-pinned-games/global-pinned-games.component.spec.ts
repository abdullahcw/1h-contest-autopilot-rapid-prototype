import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalPinnedGamesComponent } from './global-pinned-games.component';

describe('GlobalPinnedGamesComponent', () => {
  let component: GlobalPinnedGamesComponent;
  let fixture: ComponentFixture<GlobalPinnedGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalPinnedGamesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalPinnedGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
