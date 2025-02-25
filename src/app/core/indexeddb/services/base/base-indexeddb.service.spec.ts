import { TestBed } from '@angular/core/testing';

import { BaseIndexedDBService } from './base-indexeddb.service';

describe('BaseIndexedDBService', () => {
  let service: BaseIndexedDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseIndexedDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
