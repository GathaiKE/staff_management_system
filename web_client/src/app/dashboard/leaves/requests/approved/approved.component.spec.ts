import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedComponent } from './approved.component';

describe('ApprovedComponent', () => {
  let component: ApprovedComponent;
  let fixture: ComponentFixture<ApprovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
