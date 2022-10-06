import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterVehiclesComponent } from './master-vehicles.component';

describe('MasterVehiclesComponent', () => {
  let component: MasterVehiclesComponent;
  let fixture: ComponentFixture<MasterVehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterVehiclesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
