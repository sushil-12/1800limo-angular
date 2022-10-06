import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateStep3Component } from './affiliate-step3.component';

describe('AffiliateStep3Component', () => {
  let component: AffiliateStep3Component;
  let fixture: ComponentFixture<AffiliateStep3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateStep3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateStep3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
