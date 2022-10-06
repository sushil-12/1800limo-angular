import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTravelPlannerAccountComponent } from './add-travel-planner-account.component';

describe('AddTravelPlannerAccountComponent', () => {
  let component: AddTravelPlannerAccountComponent;
  let fixture: ComponentFixture<AddTravelPlannerAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTravelPlannerAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTravelPlannerAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
