import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsAdminUsersComponent } from './reports-admin-users.component';

describe('ReportsAdminUsersComponent', () => {
  let component: ReportsAdminUsersComponent;
  let fixture: ComponentFixture<ReportsAdminUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsAdminUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsAdminUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
