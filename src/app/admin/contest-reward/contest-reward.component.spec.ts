import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContestRewardComponent } from './contest-reward.component';

describe('ContestRewardComponent', () => {
  let component: ContestRewardComponent;
  let fixture: ComponentFixture<ContestRewardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContestRewardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestRewardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
