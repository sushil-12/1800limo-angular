import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryMembershipTCComponent } from './delivery-membership-t-c.component';

describe('DeliveryMembershipTCComponent', () => {
  let component: DeliveryMembershipTCComponent;
  let fixture: ComponentFixture<DeliveryMembershipTCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryMembershipTCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryMembershipTCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
