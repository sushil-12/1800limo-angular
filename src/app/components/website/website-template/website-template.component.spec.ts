import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteTemplateComponent } from './website-template.component';

describe('WebsiteTemplateComponent', () => {
  let component: WebsiteTemplateComponent;
  let fixture: ComponentFixture<WebsiteTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebsiteTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsiteTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
