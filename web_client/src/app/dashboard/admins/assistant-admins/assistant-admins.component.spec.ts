import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantAdminsComponent } from './assistant-admins.component';

describe('AssistantAdminsComponent', () => {
  let component: AssistantAdminsComponent;
  let fixture: ComponentFixture<AssistantAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantAdminsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssistantAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
