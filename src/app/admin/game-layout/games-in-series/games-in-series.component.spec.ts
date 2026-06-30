import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesInSeriesComponent } from './games-in-series.component';

describe('GamesInSeriesComponent', () => {
  let component: GamesInSeriesComponent;
  let fixture: ComponentFixture<GamesInSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamesInSeriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamesInSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
