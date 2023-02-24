import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalizeRatesComponent } from './finalize-rates.component';

describe('FinalizeRatesComponent', () => {
  let component: FinalizeRatesComponent;
  let fixture: ComponentFixture<FinalizeRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinalizeRatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalizeRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
