import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateStep2Component } from './affiliate-step2.component';

describe('AffiliateStep2Component', () => {
  let component: AffiliateStep2Component;
  let fixture: ComponentFixture<AffiliateStep2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateStep2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
