import { TestBed } from '@angular/core/testing';

import { CheckProfileCompleteGuard } from './check-profile-complete.guard';

describe('CheckProfileCompleteGuard', () => {
  let guard: CheckProfileCompleteGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CheckProfileCompleteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
