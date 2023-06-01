import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingLogsComponent } from './booking-logs.component';

describe('BookingLogsComponent', () => {
  let component: BookingLogsComponent;
  let fixture: ComponentFixture<BookingLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
