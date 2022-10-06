import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleYearsComponent } from './vehicle-years.component';

describe('VehicleYearsComponent', () => {
  let component: VehicleYearsComponent;
  let fixture: ComponentFixture<VehicleYearsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VehicleYearsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleYearsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
