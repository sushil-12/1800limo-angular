import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTravelPlannerAccountComponent } from './edit-travel-planner-account.component';

describe('EditTravelPlannerAccountComponent', () => {
  let component: EditTravelPlannerAccountComponent;
  let fixture: ComponentFixture<EditTravelPlannerAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTravelPlannerAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTravelPlannerAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
