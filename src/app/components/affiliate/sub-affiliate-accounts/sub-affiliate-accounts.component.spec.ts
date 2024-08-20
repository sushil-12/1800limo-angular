import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAffiliateAccountsComponent } from './sub-affiliate-accounts.component';

describe('SubAffiliateAccountsComponent', () => {
  let component: SubAffiliateAccountsComponent;
  let fixture: ComponentFixture<SubAffiliateAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubAffiliateAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubAffiliateAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
