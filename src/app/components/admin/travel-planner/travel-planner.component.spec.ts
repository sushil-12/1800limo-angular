import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelPlannerComponent } from './travel-planner.component';

describe('TravelPlannerComponent', () => {
  let component: TravelPlannerComponent;
  let fixture: ComponentFixture<TravelPlannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelPlannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
