import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelAgentComponent } from './travel-agent.component';

describe('TravelAgentComponent', () => {
  let component: TravelAgentComponent;
  let fixture: ComponentFixture<TravelAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelAgentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
