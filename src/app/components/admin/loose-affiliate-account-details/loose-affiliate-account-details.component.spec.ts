import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LooseAffiliateAccountDetailsComponent } from './loose-affiliate-account-details.component';

describe('LooseAffiliateAccountDetailsComponent', () => {
  let component: LooseAffiliateAccountDetailsComponent;
  let fixture: ComponentFixture<LooseAffiliateAccountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LooseAffiliateAccountDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LooseAffiliateAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
