import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LooseAffiliateVehiclesComponent } from './loose-affiliate-vehicles.component';

describe('LooseAffiliateVehiclesComponent', () => {
  let component: LooseAffiliateVehiclesComponent;
  let fixture: ComponentFixture<LooseAffiliateVehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LooseAffiliateVehiclesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LooseAffiliateVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
