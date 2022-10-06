import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverCommissionReportComponent } from './driver-commission-report.component';

describe('DriverCommissionReportComponent', () => {
  let component: DriverCommissionReportComponent;
  let fixture: ComponentFixture<DriverCommissionReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverCommissionReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverCommissionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
