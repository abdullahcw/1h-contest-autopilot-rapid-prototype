import { TestBed } from '@angular/core/testing';

import { GameSeriesService } from './game-series.service';

describe('GameSeriesService', () => {
  let service: GameSeriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameSeriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
