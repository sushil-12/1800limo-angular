import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIndividualAccountComponent } from './add-individual-account.component';

describe('AddIndividualAccountComponent', () => {
  let component: AddIndividualAccountComponent;
  let fixture: ComponentFixture<AddIndividualAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddIndividualAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddIndividualAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
