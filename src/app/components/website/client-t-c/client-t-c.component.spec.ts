import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTCComponent } from './client-t-c.component';

describe('ClientTCComponent', () => {
  let component: ClientTCComponent;
  let fixture: ComponentFixture<ClientTCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientTCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientTCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
