import { TestBed } from '@angular/core/testing';

import { PublicFunctionsService } from './public-functions.service';

describe('PublicFunctionsService', () => {
  let service: PublicFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
