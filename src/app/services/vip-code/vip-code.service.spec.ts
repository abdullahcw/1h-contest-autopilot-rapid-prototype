import { TestBed } from '@angular/core/testing';

import { VipCodeService } from './vip-code.service';

describe('VipCodeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VipCodeService = TestBed.get(VipCodeService);
    expect(service).toBeTruthy();
  });
});
