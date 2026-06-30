import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContestTrophyComponent } from './contest-trophy.component';

describe('ContestTrophyComponent', () => {
  let component: ContestTrophyComponent;
  let fixture: ComponentFixture<ContestTrophyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContestTrophyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestTrophyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
