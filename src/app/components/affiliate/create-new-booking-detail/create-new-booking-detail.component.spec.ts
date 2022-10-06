import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewBookingDetailComponent } from './create-new-booking-detail.component';

describe('CreateNewBookingDetailComponent', () => {
  let component: CreateNewBookingDetailComponent;
  let fixture: ComponentFixture<CreateNewBookingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNewBookingDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewBookingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
