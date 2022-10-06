import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMasterVehicleComponent } from './edit-master-vehicle.component';

describe('EditMasterVehicleComponent', () => {
  let component: EditMasterVehicleComponent;
  let fixture: ComponentFixture<EditMasterVehicleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditMasterVehicleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMasterVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
