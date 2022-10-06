import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceLicensingComponent } from './insurance-licensing.component';

describe('InsuranceLicensingComponent', () => {
  let component: InsuranceLicensingComponent;
  let fixture: ComponentFixture<InsuranceLicensingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuranceLicensingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceLicensingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
