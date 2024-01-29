import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualTemplateComponent } from './individual-template.component';

describe('IndividualTemplateComponent', () => {
  let component: IndividualTemplateComponent;
  let fixture: ComponentFixture<IndividualTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndividualTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
