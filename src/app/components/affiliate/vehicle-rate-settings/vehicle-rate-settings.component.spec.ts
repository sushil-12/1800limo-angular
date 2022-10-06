import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleRateSettingsComponent } from './vehicle-rate-settings.component';

describe('VehicleRateSettingsComponent', () => {
  let component: VehicleRateSettingsComponent;
  let fixture: ComponentFixture<VehicleRateSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleRateSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleRateSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
