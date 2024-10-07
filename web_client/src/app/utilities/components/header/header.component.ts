import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../dashboard/interfaces/interfaces';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor, NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  user:User | null = null
  showMenu:boolean = false
  constructor(private router:Router, private authService:AuthService){}

  ngOnInit(): void {
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>this.user = user)
  }

  openToggle(){
    this.showMenu = !this.showMenu
  }

  navigate(route:string){
    this.showMenu = false
    this.router.navigate([route])
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
}
