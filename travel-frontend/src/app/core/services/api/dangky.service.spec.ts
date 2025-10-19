import { TestBed } from '@angular/core/testing';

import { DangkyService } from './dangky.service';

describe('DangkyService', () => {
  let service: DangkyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DangkyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
