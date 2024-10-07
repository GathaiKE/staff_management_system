import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyShiftsComponent } from './my-shifts.component';

describe('MyShiftsComponent', () => {
  let component: MyShiftsComponent;
  let fixture: ComponentFixture<MyShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyShiftsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
