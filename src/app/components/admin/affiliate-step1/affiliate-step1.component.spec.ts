import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateStep1Component } from './affiliate-step1.component';

describe('AffiliateStep1Component', () => {
  let component: AffiliateStep1Component;
  let fixture: ComponentFixture<AffiliateStep1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateStep1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
