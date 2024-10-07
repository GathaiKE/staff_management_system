import { Component } from '@angular/core';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../utilities/components/header/header.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [SidenavComponent, HeaderComponent, CommonModule, RouterOutlet],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent {
  constructor(private router:Router){
    this.router.navigate(['news/news'])
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }

}
