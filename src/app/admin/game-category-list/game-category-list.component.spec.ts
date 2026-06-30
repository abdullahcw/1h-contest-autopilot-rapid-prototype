import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GameCategoryListComponent } from './game-category-list.component';

describe('GameCategoryListComponent', () => {
  let component: GameCategoryListComponent;
  let fixture: ComponentFixture<GameCategoryListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameCategoryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
