import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverLanguageComponent } from './driver-language.component';

describe('DriverLanguageComponent', () => {
  let component: DriverLanguageComponent;
  let fixture: ComponentFixture<DriverLanguageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverLanguageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
