import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientEmailConfirmationComponent } from './client-email-confirmation.component';

describe('ClientEmailConfirmationComponent', () => {
  let component: ClientEmailConfirmationComponent;
  let fixture: ComponentFixture<ClientEmailConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientEmailConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientEmailConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
