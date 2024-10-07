import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../utilities/components/header/header.component';
import { RequestsComponent } from './requests/requests.component';
import { TypesComponent } from './types/types.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DynamicComponentsService } from '../../utilities/components/dynamic-components/dynamic-components.service';
import { LeaveService } from '../services/leaves/leave.service';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, SidenavComponent, HeaderComponent, RequestsComponent, TypesComponent, RouterOutlet],
  templateUrl: './leaves.component.html',
  styleUrl: './leaves.component.css'
})
export class LeavesComponent implements OnInit{
constructor(
  private router:Router
){}

ngOnInit(): void {
this.router.navigate(['leaves/requests/pending'])
    
}

activeRoute(route:string){
  return this.router.isActive(route, true)
}

navigate(route:string){
  this.router.navigate([route])
}

}
