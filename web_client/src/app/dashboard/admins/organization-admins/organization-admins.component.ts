import { Component } from '@angular/core';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-organization-admins',
  standalone: true,
  imports: [SidenavComponent, HeaderComponent, RouterOutlet, CommonModule],
  templateUrl: './organization-admins.component.html',
  styleUrl: './organization-admins.component.css'
})
export class OrganizationAdminsComponent {
  constructor(private router:Router){
    this.router.navigate(['admins/client/all'])
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
}
