import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAgentAccountDetailsComponent } from './sub-agent-account-details.component';

describe('SubAgentAccountDetailsComponent', () => {
  let component: SubAgentAccountDetailsComponent;
  let fixture: ComponentFixture<SubAgentAccountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubAgentAccountDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubAgentAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
