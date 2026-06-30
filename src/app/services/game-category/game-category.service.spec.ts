import { TestBed } from '@angular/core/testing';

import { GameCategoryService } from './game-category.service';

describe('GameCategoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GameCategoryService = TestBed.get(GameCategoryService);
    expect(service).toBeTruthy();
  });
});
