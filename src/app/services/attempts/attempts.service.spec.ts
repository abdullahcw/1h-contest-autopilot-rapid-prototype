import { TestBed } from '@angular/core/testing';

import { AttemptsService } from './attempts.service';

describe('AttemptsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AttemptsService = TestBed.get(AttemptsService);
    expect(service).toBeTruthy();
  });
});
