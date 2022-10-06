import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedQuoteRequestComponent } from './failed-quote-request.component';

describe('FailedQuoteRequestComponent', () => {
  let component: FailedQuoteRequestComponent;
  let fixture: ComponentFixture<FailedQuoteRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FailedQuoteRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FailedQuoteRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
