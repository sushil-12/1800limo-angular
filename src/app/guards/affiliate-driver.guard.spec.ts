import { TestBed } from '@angular/core/testing';

import { AffiliateDriverGuard } from './affiliate-driver.guard';

describe('AffiliateDriverGuard', () => {
  let guard: AffiliateDriverGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AffiliateDriverGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
