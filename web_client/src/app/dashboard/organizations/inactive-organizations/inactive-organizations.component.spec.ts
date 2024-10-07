import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveOrganizationsComponent } from './inactive-organizations.component';

describe('InactiveOrganizationsComponent', () => {
  let component: InactiveOrganizationsComponent;
  let fixture: ComponentFixture<InactiveOrganizationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveOrganizationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InactiveOrganizationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
