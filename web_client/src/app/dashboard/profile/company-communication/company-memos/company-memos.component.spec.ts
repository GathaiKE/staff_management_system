import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyMemosComponent } from './company-memos.component';

describe('CompanyMemosComponent', () => {
  let component: CompanyMemosComponent;
  let fixture: ComponentFixture<CompanyMemosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyMemosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanyMemosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
