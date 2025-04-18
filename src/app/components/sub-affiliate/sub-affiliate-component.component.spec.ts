import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAffiliateComponentComponent } from './sub-affiliate-component.component';

describe('SubAffiliateComponentComponent', () => {
  let component: SubAffiliateComponentComponent;
  let fixture: ComponentFixture<SubAffiliateComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubAffiliateComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubAffiliateComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
