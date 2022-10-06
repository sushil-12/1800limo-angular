import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentByEmailComponent } from './payment-by-email.component';

describe('PaymentByEmailComponent', () => {
  let component: PaymentByEmailComponent;
  let fixture: ComponentFixture<PaymentByEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentByEmailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentByEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
