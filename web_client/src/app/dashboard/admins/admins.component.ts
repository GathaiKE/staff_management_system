import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../utilities/components/header/header.component';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, CommonModule, RouterOutlet],
  templateUrl: './admins.component.html',
  styleUrl: './admins.component.css'
})
export class AdminsComponent implements OnInit{
  showPath:boolean = false

  constructor(private router:Router, private authService:AuthService){}
  
  ngOnInit(): void {
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>{
      switch(true){
        case user?.is_assistant_superadmin || user?.is_superuser:
          this.showPath = true
          break;
        default:
          this.showPath = false
          break;
      }
    })
    switch(true){
      case this.showPath:
        this.router.navigate(['admins/assistant/all'])
        break;
      default:
        this.router.navigate(['admins/client/all'])
        break;
    }
  }
  navigate(route:string){
    this.router.navigate([route])
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }

  

}
