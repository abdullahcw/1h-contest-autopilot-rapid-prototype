import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngagmentInsightsComponent } from './engagment-insights.component';

describe('EngagmentInsightsComponent', () => {
  let component: EngagmentInsightsComponent;
  let fixture: ComponentFixture<EngagmentInsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngagmentInsightsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EngagmentInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
