import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStep0Component } from './edit-step0.component';

describe('EditStep0Component', () => {
  let component: EditStep0Component;
  let fixture: ComponentFixture<EditStep0Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditStep0Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStep0Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
