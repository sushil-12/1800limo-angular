import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterVehicleTypesComponent } from './master-vehicle-types.component';

describe('MasterVehicleTypesComponent', () => {
  let component: MasterVehicleTypesComponent;
  let fixture: ComponentFixture<MasterVehicleTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterVehicleTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterVehicleTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
