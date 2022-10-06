import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotebotComponent } from './quotebot.component';

describe('QuotebotComponent', () => {
  let component: QuotebotComponent;
  let fixture: ComponentFixture<QuotebotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotebotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotebotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
