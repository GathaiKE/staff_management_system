import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyLeaveApplicationsComponent } from './my-leave-applications.component';

describe('MyLeaveApplicationsComponent', () => {
  let component: MyLeaveApplicationsComponent;
  let fixture: ComponentFixture<MyLeaveApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyLeaveApplicationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyLeaveApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
