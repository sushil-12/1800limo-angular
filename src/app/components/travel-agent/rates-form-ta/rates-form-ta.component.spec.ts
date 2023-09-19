import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatesFormTaComponent } from './rates-form-ta.component';

describe('RatesFormTaComponent', () => {
  let component: RatesFormTaComponent;
  let fixture: ComponentFixture<RatesFormTaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RatesFormTaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatesFormTaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
