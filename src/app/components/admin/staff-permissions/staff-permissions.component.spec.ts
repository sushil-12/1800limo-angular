import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffPermissionsComponent } from './staff-permissions.component';

describe('StaffPermissionsComponent', () => {
  let component: StaffPermissionsComponent;
  let fixture: ComponentFixture<StaffPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffPermissionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
