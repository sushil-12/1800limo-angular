import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVehicleSubscriberComponent } from './add-vehicle-subscriber.component';

describe('AddVehicleSubscriberComponent', () => {
  let component: AddVehicleSubscriberComponent;
  let fixture: ComponentFixture<AddVehicleSubscriberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddVehicleSubscriberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVehicleSubscriberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
