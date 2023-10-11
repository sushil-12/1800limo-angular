import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelClientAccountsComponent } from './travel-client-accounts.component';

describe('TravelClientAccountsComponent', () => {
  let component: TravelClientAccountsComponent;
  let fixture: ComponentFixture<TravelClientAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelClientAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelClientAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
