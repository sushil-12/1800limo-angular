import { TestBed } from '@angular/core/testing';

import { ReCaptchaService } from './re-captcha.service';

describe('ReCaptchaService', () => {
  let service: ReCaptchaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReCaptchaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
