import { Component, OnInit } from '@angular/core';
import { Shift, StaffShift, User } from '../../interfaces/interfaces';
import { ShiftsService } from '../../services/shifts/shifts.service';
import { StaffService } from '../../services/staff/staff.service';
import { DatePipe, Location, NgClass, NgFor, NgIf } from '@angular/common';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { FormComponent } from '../../../utilities/components/dynamic-components/form/form.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, map } from 'rxjs';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-shift',
  standalone: true,
  imports: [DatePipe, NgFor, NgClass, FormComponent, NgIf, PaginatorComponent, SpinnerComponent],
  templateUrl: './shift.component.html',
  styleUrl: './shift.component.css'
})
export class ShiftComponent implements OnInit{
  shift:Shift | null = null
  staff:User[] = []
  staffShifts:StaffShift[] = []
  required:number = 0
  covering:number = 0
  slots:number = 0
  companyId:string = ''
  title = "New Staff"
  submit = "Add"
  abort = 'Cancel'
  size = 'fit'
  pageSize:number = 1
  currentPage:number = 1
  totalPages:number = 0
  showPag:boolean = false
  displayedData:StaffShift[] = []
  noRecords:string = 'No records found'
  showSpinner:boolean = false

  constructor(
    private shiftsService:ShiftsService,
    private staffService:StaffService,
    private route:ActivatedRoute,
    private router:Router,
    private authService:AuthService,
    private fb:FormBuilder,
    private dynamicComponenServicet:DynamicComponentsService,
    private location:Location
    ){}
  ngOnInit(): void {
    this.fetchData()
    this.initForm()
  }

  fetchData(){
    this.showSpinner = true
   this.authService.currentUser$.subscribe(user=>{
    if(user?.user_organization.organization){
      this.companyId = user.user_organization.organization.id
      this.route.params.subscribe(params=>{
        if(params['id']){
          const id:string = params['id']
          this.staffService.staffData$.subscribe(res=>this.staff = res)
          combineLatest([
            this.shiftsService.staffShifts$,
            this.shiftsService.shifts$
          ]).pipe(
            map(([staffShifts, shifts])=>{
                const shiftData = shifts.find(shift=>shift.id === id) as Shift
                const staffShiftsData = staffShifts.filter(i=>i.shift.id === id)
                return {shiftData, staffShiftsData}
            })
          ).subscribe(res=>{
            this.staffShifts = res.staffShiftsData
            this.shift = res.shiftData
            this.covering = this.staffShifts.length
            this.required = parseInt(this.shift.number_of_workers)
            this.slots = this.required - this.covering
            this.pageSize = 10
            this.totalPages = (Math.ceil((this.staffShifts.length)/this.pageSize))
            this.currentPage = 1
            this.showPag = this.totalPages > 1?true:false
            this.showSpinner = false
            this.updateDisplay()
          }
          )
        }
      })
    }
   })
  }


  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.staffShifts.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }

  details(id:string){
    this.router.navigate(['user', {id:id}])
  }

  deleteShift(id:string){
  }

  add(){
    this.showForm = true
  }

  showForm = false;
  staffShiftForm!: FormGroup;
  formConfig: { [key: string]: { label?: string, type: string, options?: string[] } } = {
    filterText: { label: 'Search staff records', type: 'text' },
    id:{type:'hidden'}
  };


  initForm() {
    this.staffShiftForm = this.fb.group({
      filterText: [''],
      id:['']
    });


    this.showForm = false
  }

  getFormValue(value: any) {
    if(value.id){
      const payload = {
        shift:this.shift?.id,
        user:value.id
      }
      console.log(payload)
      this.shiftsService.appointShift(payload).subscribe(res=>{
        console.log("Res",res)
        if(res.data.id){
          this.dynamicComponenServicet.loadFeedback("ASSigned successfully", {duration:2000})
        } else{
          this.dynamicComponenServicet.loadFeedback("Failed to assign shift", {duration:2000})
        }
      })
    }
  }

  closeForm() {
    this.staffShiftForm.reset();
    this.showForm = false;
  }

  goBack(){
    this.location.back()
  }
}
