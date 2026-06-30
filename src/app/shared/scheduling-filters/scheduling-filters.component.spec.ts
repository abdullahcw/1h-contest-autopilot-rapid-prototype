import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulingFiltersComponent } from './scheduling-filters.component';

describe('SchedulingFiltersComponent', () => {
  let component: SchedulingFiltersComponent;
  let fixture: ComponentFixture<SchedulingFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchedulingFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulingFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
