import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDashComponent } from './invoice-dash.component';

describe('InvoiceDashComponent', () => {
  let component: InvoiceDashComponent;
  let fixture: ComponentFixture<InvoiceDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceDashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
