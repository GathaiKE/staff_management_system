import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyDetailsComponent } from './verify-details.component';

describe('VerifyDetailsComponent', () => {
  let component: VerifyDetailsComponent;
  let fixture: ComponentFixture<VerifyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerifyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
