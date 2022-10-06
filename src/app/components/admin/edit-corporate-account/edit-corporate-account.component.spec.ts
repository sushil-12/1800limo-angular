import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCorporateAccountComponent } from './edit-corporate-account.component';

describe('EditCorporateAccountComponent', () => {
  let component: EditCorporateAccountComponent;
  let fixture: ComponentFixture<EditCorporateAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCorporateAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCorporateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
