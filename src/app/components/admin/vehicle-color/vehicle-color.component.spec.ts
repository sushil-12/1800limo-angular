import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleColorComponent } from './vehicle-color.component';

describe('VehicleColorComponent', () => {
  let component: VehicleColorComponent;
  let fixture: ComponentFixture<VehicleColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VehicleColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
