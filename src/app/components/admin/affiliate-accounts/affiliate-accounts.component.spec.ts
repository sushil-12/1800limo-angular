import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateAccountsComponent } from './affiliate-accounts.component';

describe('AffiliateAccountsComponent', () => {
  let component: AffiliateAccountsComponent;
  let fixture: ComponentFixture<AffiliateAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
