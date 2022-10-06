import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateStep6Component } from './affiliate-step6.component';

describe('AffiliateStep6Component', () => {
  let component: AffiliateStep6Component;
  let fixture: ComponentFixture<AffiliateStep6Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateStep6Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateStep6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
