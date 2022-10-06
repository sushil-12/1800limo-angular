import { TestBed } from '@angular/core/testing';

import { NavbarGuardGuard } from './navbar-guard.guard';

describe('NavbarGuardGuard', () => {
  let guard: NavbarGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NavbarGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
