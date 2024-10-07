import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LeaveService } from '../../services/leaves/leave.service';
import { AuthService } from '../../../auth/auth.service';
import { LeavesResponse } from '../../interfaces/interfaces';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [RouterOutlet, NgClass],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css'
})
export class RequestsComponent implements OnInit{
  organizationId:string = ''
  approved:number = 0
  rejected:number = 0
  pending:number = 0

  constructor(
    private router:Router,
    private leaveService:LeaveService,
    private authService:AuthService
    ){}
  
  ngOnInit(): void {
    this.router.navigate(['leaves/requests/pending'])
    this.fetchData()
  }

  fetchData(){

    this.authService.activeUser()
    this.authService.currentUser$.subscribe(res=>{

      if(res?.id){
        this.organizationId = res.user_organization.organization.id

        this.leaveService.fetch()
        this.leaveService.leaveApplications$.subscribe(apps=>{
          const applications = apps?.filter(a=>a.application.user.user_organization.organization.id === this.organizationId) as LeavesResponse[]
          this.pending = (applications?.filter(a=> a.status.toLowerCase().trim() === 'pending') as LeavesResponse[])?.length as number
          this.approved = (applications?.filter(a=> a.status.toLowerCase().trim() === 'approved') as LeavesResponse[])?.length as number
          this.rejected = (applications?.filter(a=> a.status.toLowerCase().trim() === 'rejected') as LeavesResponse[])?.length as number
        })
      }
    })
    
   }
  
  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }
}
