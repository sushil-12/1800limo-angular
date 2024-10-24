import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVehicleSubscriberComponent } from './edit-vehicle-subscriber.component';

describe('EditVehicleSubscriberComponent', () => {
  let component: EditVehicleSubscriberComponent;
  let fixture: ComponentFixture<EditVehicleSubscriberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditVehicleSubscriberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVehicleSubscriberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
