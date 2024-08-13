import { TestBed } from '@angular/core/testing';

import { SubAffiliateGuard } from './sub-affiliate.guard';

describe('SubAffiliateGuard', () => {
  let guard: SubAffiliateGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SubAffiliateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
