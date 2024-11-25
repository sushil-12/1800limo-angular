import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDriverSubscriberComponent } from './add-driver-subscriber.component';

describe('AddDriverSubscriberComponent', () => {
  let component: AddDriverSubscriberComponent;
  let fixture: ComponentFixture<AddDriverSubscriberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDriverSubscriberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDriverSubscriberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
