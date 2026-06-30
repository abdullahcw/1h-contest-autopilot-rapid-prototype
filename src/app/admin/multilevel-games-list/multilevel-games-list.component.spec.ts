import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MultilevelGamesListComponent } from './multilevel-games-list.component';

describe('MultilevelGamesListComponent', () => {
  let component: MultilevelGamesListComponent;
  let fixture: ComponentFixture<MultilevelGamesListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MultilevelGamesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultilevelGamesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
