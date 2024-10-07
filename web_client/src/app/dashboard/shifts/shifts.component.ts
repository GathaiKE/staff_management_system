import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../utilities/components/header/header.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicComponentsService } from '../../utilities/components/dynamic-components/dynamic-components.service';
import { NewShift, ShiftFormData, } from '../interfaces/interfaces';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ShiftsService } from '../services/shifts/shifts.service';
import { AuthService } from '../../auth/auth.service';
import { DualRowFormComponent } from '../../utilities/components/dynamic-components/dual-row-form/dual-row-form.component';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [SidenavComponent, HeaderComponent, FormsModule,ReactiveFormsModule, NgFor, DatePipe, RouterOutlet, NgClass, DualRowFormComponent, NgIf],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.css'
})
export class ShiftsComponent implements OnInit{
  organizationId:string = ''
  formConfig:{[key:string]:{label:string, type:string, options?:any[]}}  = {
    role: { type: 'text', label: 'Work Role' },
    repeat: {
      type: 'select', 
      label: 'Repetition', 
      options: [
        { value: 'daily', display: 'Daily' },
        { value: 'weekdays', display: 'Weekdays' },
        { value: 'weekends', display: 'Weekends' },
        // { value: 'custom', display: 'Custom' }
      ]
    },
    startDate: { type: 'date', label: 'Start Date' },
    endDate: { type: 'date', label: 'End Date' },
    startTime: { type: 'time', label: 'Start Time' },
    endTime: { type: 'time', label: 'End Time' },
    staffCount: { type: 'number', label: 'No of Staff Required' },
    // days:{type:'days', label:'Days'}
  }
  registerShiftForm!:FormGroup<any>
  activeForm:boolean = false

  constructor(
    private dynamicComponentService:DynamicComponentsService,
    private router:Router,
    private shiftService:ShiftsService,
    private authService:AuthService,
    private fb:FormBuilder
  ){}

  ngOnInit(): void {
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>{
      if(user?.user_organization.organization.id){
        this.organizationId = user.user_organization.organization.id
        this.initForm()
      }
    })
    this.navigate('shifts/company-shifts')
  }
  
  initForm(){
    this.registerShiftForm = this.fb.group({
      role: [''],
      repeat: [''],
      startDate: [''],
      endDate: [''],
      startTime: [''],
      endTime: [''],
      days: this.fb.group({
        s: [false],
        m: [false],
        t: [false],
        w: [false],
        th: [false],
        f: [false],
        sa: [false],
      }),
      staffCount: ['']
    })
  }

  openForm(){
    this.activeForm = true
  }
  closeForm() {
    this.activeForm = false;
  }

  getFormValue(value:any) {
    const days = [
      value.days.s?'sun':null,
      value.days.m?'mon':null,
      value.days.t?'tue':null,
      value.days.w?'wed':null,
      value.days.th?'thu':null,
      value.days.f?'fri':null,
      value.days.sa?'sat':null,
    ].filter(d=>d !== null)
    
    value = {
      ...value,
      days:days
    }
    const payload:NewShift = {
      end_date:value.endDate,
      end_time:value.endTime,
      number_of_workers:value.staffCount.toString(),
      start_date:value.startDate,
      start_time:value.startTime,
      type:value.role,
      repeat:value.repeat,
      days:value.days,
      organization: this.organizationId
    }
    this.shiftService.registerShift(payload).subscribe(res=>{
      if(res.data.id){
        this.dynamicComponentService.loadFeedback("Shift Added Successflly", {duration:2000})
      } else{
        this.dynamicComponentService.loadFeedback("Error adding shift", {duration:2500})
      }
    })
    
  }

  selectDay(day: any) {
    console.log('Day:', day);
  }



  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }
}
