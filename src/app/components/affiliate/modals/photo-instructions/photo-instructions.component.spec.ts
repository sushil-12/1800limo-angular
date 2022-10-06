import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoInstructionsComponent } from './photo-instructions.component';

describe('PhotoInstructionsComponent', () => {
  let component: PhotoInstructionsComponent;
  let fixture: ComponentFixture<PhotoInstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhotoInstructionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
