import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyShiftsComponent } from './company-shifts.component';

describe('CompanyShiftsComponent', () => {
  let component: CompanyShiftsComponent;
  let fixture: ComponentFixture<CompanyShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyShiftsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanyShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
