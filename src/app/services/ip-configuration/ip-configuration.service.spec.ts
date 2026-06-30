import { TestBed } from '@angular/core/testing';

import { IpConfigurationService } from './ip-configuration.service';

describe('IpConfigurationService', () => {
  let service: IpConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
