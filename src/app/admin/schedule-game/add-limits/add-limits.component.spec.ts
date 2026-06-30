import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddLimitsComponent } from './add-limits.component';

describe('LocationSelectionComponent', () => {
  let component: AddLimitsComponent;
  let fixture: ComponentFixture<AddLimitsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddLimitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLimitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
