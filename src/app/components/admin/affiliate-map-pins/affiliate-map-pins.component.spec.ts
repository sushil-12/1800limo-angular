import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateMapPinsComponent } from './affiliate-map-pins.component';

describe('AffiliateMapPinsComponent', () => {
  let component: AffiliateMapPinsComponent;
  let fixture: ComponentFixture<AffiliateMapPinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateMapPinsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateMapPinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
