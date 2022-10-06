import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionsComplaintsComponent } from './suggestions-complaints.component';

describe('SuggestionsComplaintsComponent', () => {
  let component: SuggestionsComplaintsComponent;
  let fixture: ComponentFixture<SuggestionsComplaintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestionsComplaintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestionsComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
