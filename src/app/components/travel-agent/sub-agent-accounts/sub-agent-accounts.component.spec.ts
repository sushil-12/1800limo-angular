import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAgentAccountsComponent } from './sub-agent-accounts.component';

describe('SubAgentAccountsComponent', () => {
  let component: SubAgentAccountsComponent;
  let fixture: ComponentFixture<SubAgentAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubAgentAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubAgentAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
