import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatesFormsComponent } from './rates-forms.component';

describe('RatesFormsComponent', () => {
  let component: RatesFormsComponent;
  let fixture: ComponentFixture<RatesFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RatesFormsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatesFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
