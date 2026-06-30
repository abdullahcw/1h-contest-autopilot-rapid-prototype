import { TestBed } from '@angular/core/testing';

import { GamePathwayService } from './game-pathway.service';

describe('GamePathwayService', () => {
  let service: GamePathwayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamePathwayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
