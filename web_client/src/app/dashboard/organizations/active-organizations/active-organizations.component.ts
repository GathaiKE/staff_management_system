import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-active-organizations',
  standalone: true,
  imports: [],
  templateUrl: './active-organizations.component.html',
  styleUrl: './active-organizations.component.css'
})
export class ActiveOrganizationsComponent {
  constructor(private router:Router){
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }

  
}
