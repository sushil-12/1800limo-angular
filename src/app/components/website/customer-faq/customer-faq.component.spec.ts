import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFaqComponent } from './customer-faq.component';

describe('CustomerFaqComponent', () => {
  let component: CustomerFaqComponent;
  let fixture: ComponentFixture<CustomerFaqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerFaqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
