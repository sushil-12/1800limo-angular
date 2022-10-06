import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewBooking2Component } from './create-new-booking2.component';

describe('CreateNewBooking2Component', () => {
  let component: CreateNewBooking2Component;
  let fixture: ComponentFixture<CreateNewBooking2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewBooking2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewBooking2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
