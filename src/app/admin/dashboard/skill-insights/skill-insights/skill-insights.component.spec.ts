import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillInsightsComponent } from './skill-insights.component';

describe('SkillInsightsComponent', () => {
  let component: SkillInsightsComponent;
  let fixture: ComponentFixture<SkillInsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkillInsightsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
