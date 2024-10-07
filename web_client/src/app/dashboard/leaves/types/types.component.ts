import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Leave, LeaveTypeFormData, NewLeaveType, UserFormData } from '../../interfaces/interfaces';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';
import { CommonModule, DatePipe } from '@angular/common';
import { LeaveService } from '../../services/leaves/leave.service';
import { AuthService } from '../../../auth/auth.service';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { DualRowFormComponent } from '../../../utilities/components/dynamic-components/dual-row-form/dual-row-form.component';
import { FormComponent } from '../../../utilities/components/dynamic-components/form/form.component';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePipe, FormComponent, PaginatorComponent, SpinnerComponent],
  templateUrl: './types.component.html',
  styleUrl: './types.component.css'
})

export class TypesComponent implements OnInit{
  leaves:Leave[] = []
  leaveErr:string = ''
  organizationId:string = ''
  searchString:string = ''
  displayedData:Leave[] = []
  showPag:boolean = false
  currentPage:number = 1
  totalPages:number = 1
  pageSize:number = 10
  newLeaveForm!:FormGroup<any>
  showForm:boolean = false
  formConfig:{[key:string]:{label:string, type:string}} = {
    name:{label:'Leave Name', type:'text'},
    days:{label:'No of Days', type:'number'},
    status:{label:'Available', type:'checkbox'}
  }
  noRecords:string = 'No records found'
  showSpinner:boolean = false

  constructor(
    private dynamicComponentSevice:DynamicComponentsService,
    private leaveService:LeaveService,
    private authService:AuthService,
    private fb:FormBuilder
  ){}


  ngOnInit(): void {
      this.fetchData()
  }

  fetchData(){
    this.showSpinner = true
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>{
      if(user?.user_organization.organization.id){
        this.organizationId = user.user_organization.organization.id
        this.leaveService.fetch()
        this.leaveService.leaveType$.subscribe(res=>{
          this.leaves = res as Leave[]
          this.pageSize = 10
          this.totalPages = (Math.ceil((this.leaves.length)/this.pageSize))
          this.currentPage = 1
          this.showPag = this.totalPages > 1?true:false
          this.showSpinner = false
          this.initForm()
          this.updateDisplay()
        })
        this.leaveService.leaveTypeErr$.subscribe(res=>{
          this.leaveErr = res?.error
        })
      }
    })
  }

  initForm(){
    this.newLeaveForm = this.fb.group({
      name:[''],
      days:[''],
      status:[false]
    })
  }

  openForm(){
    this.showForm = true
  }
  closeForm(){
    this.showForm = false
  }

  getFormValue(value:any){
    const payload:NewLeaveType = {
      type:value.name,
      days:value.days.toString(),
      organization:this.organizationId
    }
    this.leaveService.addLeaveType(payload).subscribe(res=>{
      if(res.data.id){
        this.dynamicComponentSevice.loadFeedback("Leave type registered successfully", {duration:2000})
      } else{
        this.dynamicComponentSevice.loadFeedback("Failed to register leave", {duration:2500})
      }
    })
  }

  updateLeave(leave:Leave){
    this.dynamicComponentSevice.loadForm({title:"Update Leave", activeForm:"updateLeaveType", size:"fit", action:{abort:"Cancel", submit:"Update"}, data:{type:leave}}).subscribe((res:LeaveTypeFormData)=>{
        const payload:NewLeaveType = {
          days:res.days.toString(),
          type:res.name,
          organization:leave.organization.id
        }
        this.leaveService.updateLeaveType(leave.id, payload).subscribe(res=>{
           if(res.data.id){
            this.dynamicComponentSevice.loadFeedback("Update successful", {duration:2000})
           } else{
            this.dynamicComponentSevice.loadFeedback("Update failed", {duration:2000})
           }
        })
    })
  }

  filter() {
    this.leaveService.leaveType$.subscribe(res=>{
        const admins: Leave[] = res?.filter(i=>i.organization.id === this.organizationId) as Leave[]
        const data:  Leave[] = admins.filter(i => {
          let str: string = this.searchString.toLowerCase().trim()
          return i.type.toLowerCase().trim().includes(str)
        }) as Leave[]
        this.leaves = data
    })
  }

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.leaves.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }

}
