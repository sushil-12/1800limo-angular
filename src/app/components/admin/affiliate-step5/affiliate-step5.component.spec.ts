import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateStep5Component } from './affiliate-step5.component';

describe('AffiliateStep5Component', () => {
  let component: AffiliateStep5Component;
  let fixture: ComponentFixture<AffiliateStep5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateStep5Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateStep5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
