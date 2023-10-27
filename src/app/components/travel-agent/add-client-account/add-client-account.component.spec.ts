import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientAccountComponent } from './add-client-account.component';

describe('AddClientAccountComponent', () => {
  let component: AddClientAccountComponent;
  let fixture: ComponentFixture<AddClientAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddClientAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClientAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
