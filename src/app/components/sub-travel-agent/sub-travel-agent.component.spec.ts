import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTravelAgentComponent } from './sub-travel-agent.component';

describe('SubTravelAgentComponent', () => {
  let component: SubTravelAgentComponent;
  let fixture: ComponentFixture<SubTravelAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubTravelAgentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubTravelAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
