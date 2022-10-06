import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateEmailConfirmationComponent } from './affiliate-email-confirmation.component';

describe('AffiliateEmailConfirmationComponent', () => {
  let component: AffiliateEmailConfirmationComponent;
  let fixture: ComponentFixture<AffiliateEmailConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateEmailConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateEmailConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
