import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoAddIndividualComponent } from './demo-add-individual.component';

describe('DemoAddIndividualComponent', () => {
  let component: DemoAddIndividualComponent;
  let fixture: ComponentFixture<DemoAddIndividualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DemoAddIndividualComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoAddIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
