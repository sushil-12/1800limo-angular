import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCorporateAccountComponent } from './add-corporate-account.component';

describe('AddCorporateAccountComponent', () => {
  let component: AddCorporateAccountComponent;
  let fixture: ComponentFixture<AddCorporateAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCorporateAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCorporateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
