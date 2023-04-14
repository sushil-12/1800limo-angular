import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateFinalizeComponent } from './affiliate-finalize.component';

describe('AffiliateFinalizeComponent', () => {
  let component: AffiliateFinalizeComponent;
  let fixture: ComponentFixture<AffiliateFinalizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateFinalizeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateFinalizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
