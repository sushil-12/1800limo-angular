import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetAndGreetComponent } from './meet-and-greet.component';

describe('MeetAndGreetComponent', () => {
  let component: MeetAndGreetComponent;
  let fixture: ComponentFixture<MeetAndGreetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeetAndGreetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetAndGreetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
