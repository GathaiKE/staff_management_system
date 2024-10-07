import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnLeaveComponent } from './on-leave.component';

describe('OnLeaveComponent', () => {
  let component: OnLeaveComponent;
  let fixture: ComponentFixture<OnLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnLeaveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OnLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
