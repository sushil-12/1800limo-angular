import { TestBed } from '@angular/core/testing';

import { IndividualGuardGuard } from './individual-guard.guard';

describe('IndividualGuardGuard', () => {
  let guard: IndividualGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(IndividualGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
