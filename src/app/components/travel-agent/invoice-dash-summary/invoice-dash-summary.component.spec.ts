import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDashSummaryComponent } from './invoice-dash-summary.component';

describe('InvoiceDashSummaryComponent', () => {
  let component: InvoiceDashSummaryComponent;
  let fixture: ComponentFixture<InvoiceDashSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceDashSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDashSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
