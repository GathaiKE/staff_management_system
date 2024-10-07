import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../interfaces/interfaces';

@Component({
  selector: 'app-company-communication',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './company-communication.component.html',
  styleUrl: './company-communication.component.css'
})
export class CompanyCommunicationComponent implements OnInit{
  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private authService:AuthService
     ){}
  
  ngOnInit(): void {
  this.router.navigate(['profile/news/memos'])
  }
  
  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }
}
