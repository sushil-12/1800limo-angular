import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateStepsTemplateComponent } from './affiliate-steps-template.component';

describe('AffiliateStepsTemplateComponent', () => {
  let component: AffiliateStepsTemplateComponent;
  let fixture: ComponentFixture<AffiliateStepsTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateStepsTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateStepsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
