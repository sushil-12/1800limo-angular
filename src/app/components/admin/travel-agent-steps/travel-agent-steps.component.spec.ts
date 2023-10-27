import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelAgentStepsComponent } from './travel-agent-steps.component';

describe('TravelAgentStepsComponent', () => {
  let component: TravelAgentStepsComponent;
  let fixture: ComponentFixture<TravelAgentStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelAgentStepsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelAgentStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
