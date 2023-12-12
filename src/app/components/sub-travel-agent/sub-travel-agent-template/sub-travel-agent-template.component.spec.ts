import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTravelAgentTemplateComponent } from './sub-travel-agent-template.component';

describe('SubTravelAgentTemplateComponent', () => {
  let component: SubTravelAgentTemplateComponent;
  let fixture: ComponentFixture<SubTravelAgentTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubTravelAgentTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubTravelAgentTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
