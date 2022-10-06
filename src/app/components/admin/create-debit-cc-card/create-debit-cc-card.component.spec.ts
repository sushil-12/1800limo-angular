import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDebitCcCardComponent } from './create-debit-cc-card.component';

describe('CreateDebitCcCardComponent', () => {
  let component: CreateDebitCcCardComponent;
  let fixture: ComponentFixture<CreateDebitCcCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDebitCcCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDebitCcCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
