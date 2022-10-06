import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedQuoteRequestConfirmationComponent } from './failed-quote-request-confirmation.component';

describe('FailedQuoteRequestConfirmationComponent', () => {
  let component: FailedQuoteRequestConfirmationComponent;
  let fixture: ComponentFixture<FailedQuoteRequestConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FailedQuoteRequestConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FailedQuoteRequestConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
