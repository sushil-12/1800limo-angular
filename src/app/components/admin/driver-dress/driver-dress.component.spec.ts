import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverDressComponent } from './driver-dress.component';

describe('DriverDressComponent', () => {
  let component: DriverDressComponent;
  let fixture: ComponentFixture<DriverDressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverDressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverDressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
