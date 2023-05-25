import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeCitiesComponent } from './badge-cities.component';

describe('BadgeCitiesComponent', () => {
  let component: BadgeCitiesComponent;
  let fixture: ComponentFixture<BadgeCitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgeCitiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeCitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
