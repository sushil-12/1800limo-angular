import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmenitiesSpecialComponent } from './amenities-special.component';

describe('AmenitiesSpecialComponent', () => {
  let component: AmenitiesSpecialComponent;
  let fixture: ComponentFixture<AmenitiesSpecialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmenitiesSpecialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmenitiesSpecialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
