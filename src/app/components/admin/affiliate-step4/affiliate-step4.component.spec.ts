import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateStep4Component } from './affiliate-step4.component';

describe('AffiliateStep4Component', () => {
  let component: AffiliateStep4Component;
  let fixture: ComponentFixture<AffiliateStep4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateStep4Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateStep4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
