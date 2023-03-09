import { TestBed } from '@angular/core/testing';

import { GloabalErrorHandlerService } from './gloabal-error-handler.service';

describe('GloabalErrorHandlerService', () => {
  let service: GloabalErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GloabalErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
