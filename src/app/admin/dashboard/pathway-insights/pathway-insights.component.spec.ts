import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathwayInsightsComponent } from './pathway-insights.component';

describe('PathwayInsightsComponent', () => {
  let component: PathwayInsightsComponent;
  let fixture: ComponentFixture<PathwayInsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathwayInsightsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathwayInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
