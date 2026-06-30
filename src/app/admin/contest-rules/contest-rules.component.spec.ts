import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContestRulesComponent } from './contest-rules.component';

describe('ContestRulesComponent', () => {
  let component: ContestRulesComponent;
  let fixture: ComponentFixture<ContestRulesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContestRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
