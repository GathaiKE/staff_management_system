import { Component, OnInit, TemplateRef } from '@angular/core';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Leave, LeaveApplication, LeaveApplicationFormData, LeavesResponse, NewLeaveApplication, User } from '../../interfaces/interfaces';
import { LeaveService } from '../../services/leaves/leave.service';
import { AuthService } from '../../../auth/auth.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { FormComponent } from '../../../utilities/components/dynamic-components/form/form.component';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';


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
  selector: 'app-my-leave-applications',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, NgFor, NgClass, DatePipe, FormComponent, PaginatorComponent, SpinnerComponent],
  templateUrl: './my-leave-applications.component.html',
  styleUrl: './my-leave-applications.component.css'
})
export class MyLeaveApplicationsComponent implements OnInit{
  user!:User
  applicationData:LeaveInfo[] = []
  applications:LeavesResponse[] = []
  types:Leave[] = []
  unfilteredApplications:LeavesResponse[] = []
  displayedData:LeavesResponse[] = []
  typeInfo!:TypeInfo[]
  applicationsErr?:string
  typesErr?:string
  applicationForm!:FormGroup<any>
  formConfig:{[key:string]:{type:string, label:string, options?:any[]}} ={
    leaveType:{type:'select', label:'Leave Type'},
    startDate:{label:'Start Date', type:'date'},
    endDate:{label:'End Date', type:'date'}
  }
  showForm:boolean = false
  currentPage:number = 1
  pageSize:number = 1
  totalPages:number =1
  showPag:boolean = false
  noRecords:string = 'No records found'
  showLeaveAllocationTable:boolean = false
  showSpinner:boolean = false

  constructor(
    private dynamicComponentService:DynamicComponentsService,
    private leaveService:LeaveService,
    private authService:AuthService,
    private fb:FormBuilder
    ){}

  ngOnInit(): void {
      this.fetchData()
  }

  fetchData(){
    this.showSpinner = true
    this.authService.currentUser$.subscribe(res=>{
      if(res){
        this.user = res
        this.leaveService.fetch()
        this.leaveService.leaveApplications$.subscribe(apps=>{
          if(apps){
            apps.filter(a=>a.application.user.id === this.user.id)
            this.unfilteredApplications = apps
            this.applications = apps
            this.pageSize = 10
            this.totalPages = (Math.ceil((this.applications.length)/this.pageSize))
            this.currentPage = 1
            this.showPag = this.totalPages > 1?true:false
            this.showSpinner = false
            this.updateDisplay()
            this.applicationData = this.applications.map(app=>{
              const result:LeaveInfo ={
                leave:app,
                daysAvailable:parseInt(app.application.leavetype.days) - parseInt(app.application.leave_days)<0?0:parseInt(app.application.leavetype.days) - parseInt(app.application.leave_days),
                daysUsed:parseInt(app.application.leave_days)
              }
              return result
            })
            this.showLeaveAllocationTable = this.applicationData?.length === 0?false:true
            
            this.initForm()
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

  initForm(){
    this.applicationForm = this.fb.group({
      leaveType:[''],
      startDate:[''],
      endDate:['']
    })
  }

  openForm(){
    this.showForm = true
  }

  closeForm(){
    this.showForm = false
  }

  getFormValue(value:any){
    const payload:NewLeaveApplication = {
      end_date:value.endDate,
      reason:value.leaveType,
      start_date:value.startDate,
      user:this.user.id,
      leavetype:value.leaveType,
      leave_days:this.getDays(value.startDate, value.endDate).toString()
    }
    this.leaveService.sendLeaveApplication(payload).subscribe(res=>{

      if(res.data.id){
        this.leaveService.setApplicationStatus(res.data.id).subscribe(res=>{
          if(res.data.id){
            this.dynamicComponentService.loadFeedback("Application Sent Successfully", {duration:2000})
          } else{
            this.dynamicComponentService.loadFeedback("Failed to send application", {duration:2500})
          }
        })
      }
      
    })
    
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

filter(event:Event){
  const val = (event.target as HTMLSelectElement)?.value.trim().toLowerCase()
  this.applications = val === 'all'?this.applications = this.unfilteredApplications:this.unfilteredApplications.filter(app=>app.status === val)
  this.updateDisplay()
}

updateDisplay() {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.displayedData = this.applications.slice(startIndex, endIndex)
}

onPageChange(page:number){
  this.currentPage = page
  this.updateDisplay()
}
}
