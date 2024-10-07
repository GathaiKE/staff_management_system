import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../dashboard/interfaces/interfaces';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent implements OnInit{
  user:User | null = null
constructor(private router:Router, private authService:AuthService){}
ngOnInit(): void {
  this.authService.activeUser()
  this.authService.currentUser$.subscribe(user=>this.user = user)
}
  navigate(route:string){
    this.router.navigate([route])
  }

  logOut(){
   this.authService.logOut()
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
}
