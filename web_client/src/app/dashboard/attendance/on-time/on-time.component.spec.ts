import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnTimeComponent } from './on-time.component';

describe('OnTimeComponent', () => {
  let component: OnTimeComponent;
  let fixture: ComponentFixture<OnTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnTimeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OnTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
