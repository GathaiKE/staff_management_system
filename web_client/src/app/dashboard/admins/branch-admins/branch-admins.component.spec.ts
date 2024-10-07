import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchAdminsComponent } from './branch-admins.component';

describe('BranchAdminsComponent', () => {
  let component: BranchAdminsComponent;
  let fixture: ComponentFixture<BranchAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchAdminsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
