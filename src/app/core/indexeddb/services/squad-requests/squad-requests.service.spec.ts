import { TestBed } from '@angular/core/testing';
import { SquadRequestsService } from './squad-requests.service';

describe('SquadRequestsService', () => {
  let service: SquadRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SquadRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
