import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsAdminVehiclesComponent } from './reports-admin-vehicles.component';

describe('ReportsAdminVehiclesComponent', () => {
  let component: ReportsAdminVehiclesComponent;
  let fixture: ComponentFixture<ReportsAdminVehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsAdminVehiclesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsAdminVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
