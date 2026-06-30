import { TestBed } from '@angular/core/testing';

import { GameReorderService } from './game-reorder.service';

describe('GameReorderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GameReorderService = TestBed.get(GameReorderService);
    expect(service).toBeTruthy();
  });
});
