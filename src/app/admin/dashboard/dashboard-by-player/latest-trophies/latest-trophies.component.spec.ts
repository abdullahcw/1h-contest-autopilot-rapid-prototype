import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestTrophiesComponent } from './latest-trophies.component';

describe('LatestTrophiesComponent', () => {
  let component: LatestTrophiesComponent;
  let fixture: ComponentFixture<LatestTrophiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LatestTrophiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestTrophiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
