import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyMemberAccountComponent } from './family-member-account.component';

describe('FamilyMemberAccountComponent', () => {
  let component: FamilyMemberAccountComponent;
  let fixture: ComponentFixture<FamilyMemberAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FamilyMemberAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyMemberAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
