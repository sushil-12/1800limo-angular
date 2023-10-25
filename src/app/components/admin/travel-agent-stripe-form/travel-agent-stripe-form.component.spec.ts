import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelAgentStripeFormComponent } from './travel-agent-stripe-form.component';

describe('TravelAgentStripeFormComponent', () => {
  let component: TravelAgentStripeFormComponent;
  let fixture: ComponentFixture<TravelAgentStripeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelAgentStripeFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelAgentStripeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
