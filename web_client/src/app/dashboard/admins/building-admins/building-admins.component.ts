import { Component } from '@angular/core';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-building-admins',
  standalone: true,
  imports: [SidenavComponent, HeaderComponent, CommonModule, RouterOutlet],
  templateUrl: './building-admins.component.html',
  styleUrl: './building-admins.component.css'
})
export class BuildingAdminsComponent {
  constructor(private router:Router){
    this.router.navigate(['admins/building/all'])
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
}
