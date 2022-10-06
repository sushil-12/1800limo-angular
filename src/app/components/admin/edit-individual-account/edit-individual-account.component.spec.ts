import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIndividualAccountComponent } from './edit-individual-account.component';

describe('EditIndividualAccountComponent', () => {
  let component: EditIndividualAccountComponent;
  let fixture: ComponentFixture<EditIndividualAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditIndividualAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditIndividualAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
