import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliatePreferenceComponent } from './affiliate-preference.component';

describe('AffiliatePreferenceComponent', () => {
  let component: AffiliatePreferenceComponent;
  let fixture: ComponentFixture<AffiliatePreferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliatePreferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliatePreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
