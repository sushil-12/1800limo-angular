import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStep6Component } from './edit-step6.component';

describe('EditStep6Component', () => {
  let component: EditStep6Component;
  let fixture: ComponentFixture<EditStep6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditStep6Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStep6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
