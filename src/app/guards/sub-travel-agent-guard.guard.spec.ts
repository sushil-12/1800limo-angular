import { TestBed } from '@angular/core/testing';

import { SubTravelAgentGuardGuard } from './sub-travel-agent-guard.guard';

describe('SubTravelAgentGuardGuard', () => {
  let guard: SubTravelAgentGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SubTravelAgentGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
