import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotebotTemplateComponent } from './quotebot-template.component';

describe('QuotebotTemplateComponent', () => {
  let component: QuotebotTemplateComponent;
  let fixture: ComponentFixture<QuotebotTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotebotTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotebotTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
