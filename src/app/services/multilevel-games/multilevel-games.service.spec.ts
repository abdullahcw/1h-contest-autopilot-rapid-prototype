import { TestBed } from '@angular/core/testing';

import { MultilevelGamesService } from './multilevel-games.service';

describe('MultilevelGamesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MultilevelGamesService = TestBed.get(MultilevelGamesService);
    expect(service).toBeTruthy();
  });
});
