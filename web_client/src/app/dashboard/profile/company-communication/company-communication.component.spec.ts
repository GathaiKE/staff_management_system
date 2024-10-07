import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyCommunicationComponent } from './company-communication.component';

describe('CompanyCommunicationComponent', () => {
  let component: CompanyCommunicationComponent;
  let fixture: ComponentFixture<CompanyCommunicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyCommunicationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanyCommunicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
