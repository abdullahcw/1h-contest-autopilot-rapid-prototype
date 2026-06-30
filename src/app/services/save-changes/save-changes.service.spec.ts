import { TestBed } from '@angular/core/testing';

import { SaveChangesService } from './save-changes.service';

describe('SaveChangesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SaveChangesService = TestBed.get(SaveChangesService);
    expect(service).toBeTruthy();
  });
});
