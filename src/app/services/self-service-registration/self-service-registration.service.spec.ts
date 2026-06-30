import { TestBed } from '@angular/core/testing';

import { SelfServiceRegistrationService } from './self-service-registration.service';

describe('SelfServiceRegistrationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SelfServiceRegistrationService = TestBed.get(SelfServiceRegistrationService);
    expect(service).toBeTruthy();
  });
});
