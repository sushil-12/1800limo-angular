import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourGuideReportComponent } from './tour-guide-report.component';

describe('TourGuideReportComponent', () => {
  let component: TourGuideReportComponent;
  let fixture: ComponentFixture<TourGuideReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TourGuideReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourGuideReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
