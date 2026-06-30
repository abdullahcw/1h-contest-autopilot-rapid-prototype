import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalGameplayByContestComponent } from './total-gameplay-by-contest.component';

describe('TotalGameplayByContestComponent', () => {
  let component: TotalGameplayByContestComponent;
  let fixture: ComponentFixture<TotalGameplayByContestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalGameplayByContestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalGameplayByContestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
