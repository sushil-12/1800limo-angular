import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationCancellationComponent } from './reservation-cancellation.component';

describe('ReservationCancellationComponent', () => {
  let component: ReservationCancellationComponent;
  let fixture: ComponentFixture<ReservationCancellationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationCancellationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
