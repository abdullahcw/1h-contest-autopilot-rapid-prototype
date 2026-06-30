import { TestBed } from '@angular/core/testing';

import { CustomAudienceService } from './custom-audience.service';

describe('CustomAudienceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomAudienceService = TestBed.get(CustomAudienceService);
    expect(service).toBeTruthy();
  });
});
