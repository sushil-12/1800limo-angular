import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterVehicleComponent } from './master-vehicle.component';

describe('MasterVehicleComponent', () => {
  let component: MasterVehicleComponent;
  let fixture: ComponentFixture<MasterVehicleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterVehicleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
