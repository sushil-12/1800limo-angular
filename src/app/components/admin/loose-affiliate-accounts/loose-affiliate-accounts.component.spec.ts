import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LooseAffiliateAccountsComponent } from './loose-affiliate-accounts.component';

describe('LooseAffiliateAccountsComponent', () => {
  let component: LooseAffiliateAccountsComponent;
  let fixture: ComponentFixture<LooseAffiliateAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LooseAffiliateAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LooseAffiliateAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
