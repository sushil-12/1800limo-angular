import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualConfirmationComponent } from './individual-confirmation.component';

describe('IndividualConfirmationComponent', () => {
  let component: IndividualConfirmationComponent;
  let fixture: ComponentFixture<IndividualConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndividualConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
