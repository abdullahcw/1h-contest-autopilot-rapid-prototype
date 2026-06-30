import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneAchivedComponent } from './milestone-achived.component';

describe('MilestoneAchivedComponent', () => {
  let component: MilestoneAchivedComponent;
  let fixture: ComponentFixture<MilestoneAchivedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MilestoneAchivedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestoneAchivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
