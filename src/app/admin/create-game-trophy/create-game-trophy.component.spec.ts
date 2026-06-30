import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateGameTrophyComponent } from './create-game-trophy.component';

describe('CreateGameTrophyComponent', () => {
  let component: CreateGameTrophyComponent;
  let fixture: ComponentFixture<CreateGameTrophyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGameTrophyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGameTrophyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
