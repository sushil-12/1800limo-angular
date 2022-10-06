import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateTemplateComponent } from './affiliate-template.component';

describe('AffiliateTemplateComponent', () => {
  let component: AffiliateTemplateComponent;
  let fixture: ComponentFixture<AffiliateTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
