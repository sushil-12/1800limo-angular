import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchEmailConfirmationComponent } from './dispatch-email-confirmation.component';

describe('DispatchEmailConfirmationComponent', () => {
  let component: DispatchEmailConfirmationComponent;
  let fixture: ComponentFixture<DispatchEmailConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DispatchEmailConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchEmailConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
