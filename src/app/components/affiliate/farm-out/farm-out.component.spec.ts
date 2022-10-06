import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmOutComponent } from './farm-out.component';

describe('FarmOutComponent', () => {
  let component: FarmOutComponent;
  let fixture: ComponentFixture<FarmOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FarmOutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
