import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelAgentStepsTemplateComponent } from './travel-agent-steps-template.component';

describe('TravelAgentStepsTemplateComponent', () => {
  let component: TravelAgentStepsTemplateComponent;
  let fixture: ComponentFixture<TravelAgentStepsTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelAgentStepsTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelAgentStepsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
