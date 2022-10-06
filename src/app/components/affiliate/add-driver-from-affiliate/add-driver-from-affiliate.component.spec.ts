import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDriverFromAffiliateComponent } from './add-driver-from-affiliate.component';

describe('AddDriverFromAffiliateComponent', () => {
  let component: AddDriverFromAffiliateComponent;
  let fixture: ComponentFixture<AddDriverFromAffiliateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDriverFromAffiliateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDriverFromAffiliateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
