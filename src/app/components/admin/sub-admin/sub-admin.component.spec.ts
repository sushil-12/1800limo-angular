import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAdminComponent } from './sub-admin.component';

describe('SubAdminComponent', () => {
  let component: SubAdminComponent;
  let fixture: ComponentFixture<SubAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
