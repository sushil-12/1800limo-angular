import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateStep0Component } from './affiliate-step0.component';

describe('AffiliateStep0Component', () => {
  let component: AffiliateStep0Component;
  let fixture: ComponentFixture<AffiliateStep0Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateStep0Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateStep0Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
