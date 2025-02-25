import { TestBed } from '@angular/core/testing';

import { CrossAllocationsService } from './cross-allocations.service';

describe('CrossAllocationsService', () => {
  let service: CrossAllocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrossAllocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
