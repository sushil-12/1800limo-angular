import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcoAccountsComponent } from './cco-accounts.component';

describe('CcoAccountsComponent', () => {
  let component: CcoAccountsComponent;
  let fixture: ComponentFixture<CcoAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcoAccountsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CcoAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
