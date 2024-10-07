import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Leave, LeavesResponse, User } from '../../../interfaces/interfaces';
import { StaffService } from '../../../services/staff/staff.service';
import { DynamicComponentsService } from '../../../../utilities/components/dynamic-components/dynamic-components.service';
import { LeaveService } from '../../../services/leaves/leave.service';
import { AuthService } from '../../../../auth/auth.service';
import { combineLatest, map } from 'rxjs';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';

interface LeaveInfo {
  leave:LeavesResponse
  daysUsed:number
  daysAvailable:number
}

interface TypeInfo {
  id:string
  type:string
  used:number
  entitled:number
  available:number
}

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, DatePipe, PaginatorComponent],
  templateUrl: './leaves.component.html',
  styleUrl: './leaves.component.css'
})
export class LeavesComponent {
  user!:User
  applicationData!:LeaveInfo[]
  applications!:LeavesResponse[]
  types!:Leave[]
  typeInfo!:TypeInfo[]
  applicationsErr?:string
  typesErr?:string
  currentPage:number = 1
  pageSize: number = 1
  displayedData:LeavesResponse[] = []
  showPag:boolean = false
  totalPages:number = 1
  noRecords:string = 'No records found'
  showTypeInfo:boolean = false

  constructor(
    private leaveService:LeaveService,
    private route:ActivatedRoute,
    private staffService:StaffService
    ){}

  ngOnInit(): void {
      this.fetchData()
  }

  fetchData(){
    this.route.params.subscribe(params=>{
      if(params['id']){
        console.log(params['id'])
        const id:string = params['id'] as string

        this.staffService.fetchStaff()
        this.staffService.staffData$.subscribe(res=>{
          this.user = res.find(i=>i.id === id) as User
        })
        this.leaveService.fetch()
        this.leaveService.leaveApplications$.subscribe(apps=>{
          if(apps){
            this.applications = apps.filter(a=>a.application.user.id === this.user.id)
            this.applicationData = this.applications.map(app=>{
              const result:LeaveInfo ={
                leave:app,
                daysAvailable:parseInt(app.application.leavetype.days) - parseInt(app.application.leave_days)<0?0:parseInt(app.application.leavetype.days) - parseInt(app.application.leave_days),
                daysUsed:parseInt(app.application.leave_days)
              }
              return result
            })
            this.showTypeInfo = this.applicationData?.length === 0?false:true
            this.pageSize = 10
            this.totalPages = (Math.ceil((this.applicationData?.length)/this.pageSize))
            this.currentPage = 1
            this.showPag = this.totalPages > 1?true:false
            this.updateDisplay()

          }
        })

        this.leaveService.leaveType$.subscribe(types=>types?this.types = types:[])
            
        this.leaveService.leaveApplicationsErr$.subscribe(err=>this.applicationsErr = err?.error)

        this.leaveService.leaveTypeErr$.subscribe(err=>this.typesErr = err?.error)
      }
    })

    combineLatest([
      this.leaveService.leaveType$,
      this.leaveService.leaveApplications$
    ]).pipe(
      map(([types, apps])=>{
        if(apps && types){
          const filteredApps:LeavesResponse[] = apps.filter(a=>a.application.user.id === this.user.id)
          return {apps:filteredApps, types}
        }

        return {apps:[], types:[]}
      })
    ).subscribe(({types, apps})=>{
      this.typeInfo = this.calculateRemainingDays(types, apps)
    })
  }

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.applications?.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
  getDays(from:string, to:string):number{
    return ((new Date(to).getTime() - new Date(from).getTime())/ (1000 * 60 * 60 * 24)) + 1
  }

  calculateRemainingDays(leaveTypes:Leave[], applications:LeavesResponse[]):TypeInfo[] {
    const result:TypeInfo[] = [];
    leaveTypes.forEach(leaveType => {
        const totalDaysUsed = applications.reduce((total, app) => {
            if (app.application.leavetype.id === leaveType.id && app.status === 'approved') {
                return total + parseInt(app.application.leave_days);
            }
            return total;
        }, 0);
        
        const remainingDays = parseInt(leaveType.days) - totalDaysUsed;
        const data:TypeInfo ={
            id:leaveType.id,
            type: leaveType.type,
            entitled: parseInt(leaveType.days),
            used: totalDaysUsed,
            available: remainingDays >= 0 ? remainingDays : 0 // Ensure remaining days is not negative
        }
        result.push(data);
    });
    
    return result;
}

}
