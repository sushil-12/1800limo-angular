import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverAccountsComponent } from './recover-accounts.component';

describe('RecoverAccountsComponent', () => {
  let component: RecoverAccountsComponent;
  let fixture: ComponentFixture<RecoverAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecoverAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
