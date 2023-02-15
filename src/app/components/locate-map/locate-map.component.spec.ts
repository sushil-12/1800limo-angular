import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocateMapComponent } from './locate-map.component';

describe('LocateMapComponent', () => {
  let component: LocateMapComponent;
  let fixture: ComponentFixture<LocateMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocateMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocateMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
