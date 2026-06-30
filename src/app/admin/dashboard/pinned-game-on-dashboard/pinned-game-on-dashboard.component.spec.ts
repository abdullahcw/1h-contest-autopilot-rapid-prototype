import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnedGameOnDashboardComponent } from './pinned-game-on-dashboard.component';

describe('PinnedGameOnDashboardComponent', () => {
  let component: PinnedGameOnDashboardComponent;
  let fixture: ComponentFixture<PinnedGameOnDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PinnedGameOnDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PinnedGameOnDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
