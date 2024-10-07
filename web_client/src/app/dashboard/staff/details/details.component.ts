import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../interfaces/interfaces';
import { BehaviorSubject, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { StaffService } from '../../services/staff/staff.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [RouterOutlet, NgClass, SidenavComponent, HeaderComponent, DatePipe, NgIf],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent implements OnInit, OnDestroy{
  private unsubscribe$ = new Subject<void>();
  user!:User
  constructor(
    private router:Router, 
    private dynamicComponentService:DynamicComponentsService,
    private authService:AuthService,
    private activatedRoute:ActivatedRoute,
    private staffService:StaffService
  ){}
  
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params=>{
      if(params['id']){
        const userId:string = params['id']
        this.staffService.fetchStaff()
        this.staffService.staffData$.subscribe(users=>{
          this.user = users.find(u=>u.id === userId) as User
          
        })
        this.router.navigate(['user/leaves', {id:userId}])
      }
    })

    console.log("User",this.user);
    
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateUserInfo(){
    const id:string = localStorage.getItem("user")?localStorage.getItem("user") as string:''
    this.dynamicComponentService.loadForm({activeForm:"updateUser",size:'fit', title:'Update Profile', duration:'2500',action:{abort:'Cancel', submit:'Update'}, data:{id:id}}).subscribe(res=>console.log(res))
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
  
  navigate(route:string){
    this.router.navigate([route, {id:this.user.id}])
  }
}
