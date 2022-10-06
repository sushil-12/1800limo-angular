import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterVehicleFareComponent } from './master-vehicle-fare.component';

describe('MasterVehicleFareComponent', () => {
  let component: MasterVehicleFareComponent;
  let fixture: ComponentFixture<MasterVehicleFareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterVehicleFareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterVehicleFareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
