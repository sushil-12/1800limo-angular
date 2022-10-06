import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTravelPlannerComponent } from './group-travel-planner.component';

describe('GroupTravelPlannerComponent', () => {
  let component: GroupTravelPlannerComponent;
  let fixture: ComponentFixture<GroupTravelPlannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTravelPlannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTravelPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
