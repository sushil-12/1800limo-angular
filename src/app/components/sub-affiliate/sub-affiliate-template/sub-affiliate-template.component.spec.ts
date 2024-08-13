import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAffiliateTemplateComponent } from './sub-affiliate-template.component';

describe('SubAffiliateTemplateComponent', () => {
  let component: SubAffiliateTemplateComponent;
  let fixture: ComponentFixture<SubAffiliateTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubAffiliateTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubAffiliateTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
