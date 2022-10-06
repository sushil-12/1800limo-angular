import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverEmailConfirmationComponent } from './driver-email-confirmation.component';

describe('DriverEmailConfirmationComponent', () => {
  let component: DriverEmailConfirmationComponent;
  let fixture: ComponentFixture<DriverEmailConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverEmailConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverEmailConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
