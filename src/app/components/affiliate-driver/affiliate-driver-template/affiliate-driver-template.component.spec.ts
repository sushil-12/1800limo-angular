import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateDriverTemplateComponent } from './affiliate-driver-template.component';

describe('AffiliateDriverTemplateComponent', () => {
  let component: AffiliateDriverTemplateComponent;
  let fixture: ComponentFixture<AffiliateDriverTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateDriverTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateDriverTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
