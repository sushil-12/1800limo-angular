import { TestBed } from '@angular/core/testing';

import { IndvOtherGuardGuard } from './indv-other-guard.guard';

describe('IndvOtherGuardGuard', () => {
  let guard: IndvOtherGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(IndvOtherGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
