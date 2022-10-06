import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmenitiesInteriorComponent } from './amenities-interior.component';

describe('AmenitiesInteriorComponent', () => {
  let component: AmenitiesInteriorComponent;
  let fixture: ComponentFixture<AmenitiesInteriorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmenitiesInteriorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmenitiesInteriorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
