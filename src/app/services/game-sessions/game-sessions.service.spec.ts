import { TestBed } from '@angular/core/testing';

import { GameSessionsService } from './game-sessions.service';

describe('GameSessionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GameSessionsService = TestBed.get(GameSessionsService);
    expect(service).toBeTruthy();
  });
});
