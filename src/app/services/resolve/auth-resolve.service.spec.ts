import { TestBed } from '@angular/core/testing';

import { AuthResolveService } from './auth-resolve.service';

describe('AuthResolveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthResolveService = TestBed.get(AuthResolveService);
    expect(service).toBeTruthy();
  });
});
