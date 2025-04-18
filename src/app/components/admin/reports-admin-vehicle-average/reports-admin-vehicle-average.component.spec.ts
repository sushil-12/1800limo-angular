import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsAdminVehicleAverageComponent } from './reports-admin-vehicle-average.component';

describe('ReportsAdminVehicleAverageComponent', () => {
  let component: ReportsAdminVehicleAverageComponent;
  let fixture: ComponentFixture<ReportsAdminVehicleAverageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsAdminVehicleAverageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsAdminVehicleAverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
