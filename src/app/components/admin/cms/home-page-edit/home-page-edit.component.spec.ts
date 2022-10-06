import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageEditComponent } from './home-page-edit.component';

describe('HomePageEditComponent', () => {
  let component: HomePageEditComponent;
  let fixture: ComponentFixture<HomePageEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomePageEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
