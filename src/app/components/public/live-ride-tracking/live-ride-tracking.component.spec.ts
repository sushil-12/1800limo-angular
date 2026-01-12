import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveRideTrackingComponent } from './live-ride-tracking.component';

describe('LiveRideTrackingComponent', () => {
  let component: LiveRideTrackingComponent;
  let fixture: ComponentFixture<LiveRideTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveRideTrackingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveRideTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
