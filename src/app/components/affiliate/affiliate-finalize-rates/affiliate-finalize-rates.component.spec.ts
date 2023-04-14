import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateFinalizeRatesComponent } from './affiliate-finalize-rates.component';

describe('AffiliateFinalizeRatesComponent', () => {
  let component: AffiliateFinalizeRatesComponent;
  let fixture: ComponentFixture<AffiliateFinalizeRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateFinalizeRatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateFinalizeRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
