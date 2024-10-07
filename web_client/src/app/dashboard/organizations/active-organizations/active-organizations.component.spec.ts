import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveOrganizationsComponent } from './active-organizations.component';

describe('ActiveOrganizationsComponent', () => {
  let component: ActiveOrganizationsComponent;
  let fixture: ComponentFixture<ActiveOrganizationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveOrganizationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActiveOrganizationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
