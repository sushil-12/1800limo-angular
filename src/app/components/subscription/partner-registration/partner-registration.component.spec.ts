import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerRegistrationComponent } from './partner-registration.component';

describe('PartnerRegistrationComponent', () => {
  let component: PartnerRegistrationComponent;
  let fixture: ComponentFixture<PartnerRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartnerRegistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
