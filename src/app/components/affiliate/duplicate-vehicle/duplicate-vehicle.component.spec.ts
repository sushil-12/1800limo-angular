import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateVehicleComponent } from './duplicate-vehicle.component';

describe('DuplicateVehicleComponent', () => {
  let component: DuplicateVehicleComponent;
  let fixture: ComponentFixture<DuplicateVehicleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicateVehicleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
