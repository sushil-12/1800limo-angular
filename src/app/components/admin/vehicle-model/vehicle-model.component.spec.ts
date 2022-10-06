import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleModelComponent } from './vehicle-model.component';

describe('VehicleModelComponent', () => {
  let component: VehicleModelComponent;
  let fixture: ComponentFixture<VehicleModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VehicleModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
