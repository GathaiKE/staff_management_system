import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inactive-organizations',
  standalone: true,
  imports: [],
  templateUrl: './inactive-organizations.component.html',
  styleUrl: './inactive-organizations.component.css'
})
export class InactiveOrganizationsComponent {
  constructor(private router:Router){
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }
}
