import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyBookingsComponent } from './daily-bookings.component';

describe('DailyBookingsComponent', () => {
  let component: DailyBookingsComponent;
  let fixture: ComponentFixture<DailyBookingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyBookingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
