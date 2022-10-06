import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelPlannerReportComponent } from './travel-planner-report.component';

describe('TravelPlannerReportComponent', () => {
  let component: TravelPlannerReportComponent;
  let fixture: ComponentFixture<TravelPlannerReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelPlannerReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelPlannerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
