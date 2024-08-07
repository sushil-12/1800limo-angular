import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetPageEditComponent } from './fleet-page-edit.component';

describe('FleetPageEditComponent', () => {
  let component: FleetPageEditComponent;
  let fixture: ComponentFixture<FleetPageEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetPageEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetPageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
