import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateDriverComponent } from './affiliate-driver.component';

describe('AffiliateDriverComponent', () => {
  let component: AffiliateDriverComponent;
  let fixture: ComponentFixture<AffiliateDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateDriverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
