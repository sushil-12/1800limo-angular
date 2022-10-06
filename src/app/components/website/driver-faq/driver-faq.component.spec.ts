import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverFaqComponent } from './driver-faq.component';

describe('DriverFaqComponent', () => {
  let component: DriverFaqComponent;
  let fixture: ComponentFixture<DriverFaqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverFaqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
