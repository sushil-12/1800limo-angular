import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTravelPlannerAccountComponent } from './sub-travel-planner-account.component';

describe('SubTravelPlannerAccountComponent', () => {
  let component: SubTravelPlannerAccountComponent;
  let fixture: ComponentFixture<SubTravelPlannerAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubTravelPlannerAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubTravelPlannerAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
