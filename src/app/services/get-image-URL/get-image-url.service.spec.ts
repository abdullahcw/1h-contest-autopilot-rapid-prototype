import { TestBed } from '@angular/core/testing';

import { GetImageURLService } from './get-image-url.service';

describe('GetImageURLService', () => {
  let service: GetImageURLService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetImageURLService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
