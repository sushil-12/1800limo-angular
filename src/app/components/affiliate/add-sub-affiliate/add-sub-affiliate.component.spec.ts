import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubAffiliateComponent } from './add-sub-affiliate.component';

describe('AddSubAffiliateComponent', () => {
  let component: AddSubAffiliateComponent;
  let fixture: ComponentFixture<AddSubAffiliateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSubAffiliateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSubAffiliateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
