import { Component } from '@angular/core';
import { NewShift, Shift, ShiftFormData } from '../../interfaces/interfaces';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';
import { ShiftsService } from '../../services/shifts/shifts.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-company-shifts',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, PaginatorComponent, FormsModule, SpinnerComponent],
  templateUrl: './company-shifts.component.html',
  styleUrl: './company-shifts.component.css'
})
export class CompanyShiftsComponent {
  shifts:Shift[] = []
  fetchErr!:string
  organizationId!:string
  pageSize:number = 1
  currentPage:number = 1
  totalPages:number = 0
  showPag:boolean = false
  displayedData:Shift[] = []
  unfilteredShifts:Shift[] = []
  searchString:string = ''
  noRecords:string = 'No records found'
  showSpinner:boolean = false

  constructor(
    private dynamicComponentsService:DynamicComponentsService,
    private shiftService:ShiftsService,
    private router:Router,
    private authService:AuthService
  ){}

  details(id:string){
    this.router.navigate(['shifts/shift', {id:id}])
  }

  ngOnInit(): void {
    
    this.fetchData()
  }

  fetchData(){
    this.showSpinner = true
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>{
      if(user?.user_organization.organization.id){
        this.organizationId = user.user_organization.organization.id
        this.shiftService.fetch()
        this.shiftService.shifts$.subscribe(res=>{
          this.shifts = res
          this.unfilteredShifts = res
          this.pageSize = 10
          this.totalPages = (Math.ceil((this.shifts.length)/this.pageSize))
          this.currentPage = 1
          this.showPag = this.totalPages > 1?true:false
          this.showSpinner = false
          this.updateDisplay()
        })
        this.shiftService.shiftErr$.subscribe(res=>this.fetchErr = res?.error)
      }
    })
  }

  filter() {
    const shifts:Shift[] = this.unfilteredShifts as Shift[]
    const data: Shift[] = shifts.filter(i => {
      let str: string = this.searchString.toLowerCase().trim()
      return (
        i.type.toLowerCase().trim().includes(str) ||
        i.repeat.toLowerCase().trim().includes(str)
      )
    })
    this.shifts = data
    this.updateDisplay()
}

filterByDate(event: Event): void {
  const shifts:Shift[] = this.unfilteredShifts as Shift[]
  const value: string = (event.target as HTMLInputElement).value
  let date = new Date(value);
  let filteredRecords = shifts.filter(record => {
    let recordDate = new Date(record.start_date);
    return recordDate.toDateString() === date.toDateString();
  });
  this.shifts = filteredRecords
  this.updateDisplay()
}

  updateShift(shift:Shift){
    this.dynamicComponentsService.loadForm({title:"Update Shift", activeForm:"updateShift", size:'fit', action:{abort:"Cancel", submit:"Update"}, data:{shift:shift}}).subscribe((res:ShiftFormData)=>{
      
      const payload:NewShift = {
        end_date:res.endDate,
        end_time:res.endTime,
        number_of_workers:res.staffCount.toString(),
        start_date:res.startDate,
        start_time:res.startTime,
        type:res.role,
        days:res.days,
        organization:this.organizationId,
        repeat:res.repeat
      }

      this.shiftService.updateShift(shift.id, payload).subscribe(res=>{
        if(res.data.id){
          this.dynamicComponentsService.loadFeedback("Shift updated Successflly", {duration:2000})
        } else{
          this.dynamicComponentsService.loadFeedback("Error updating shift", {duration:2500})
        }
      })
    })
  }

  deleteShift(id:string){
    this.dynamicComponentsService.confirmAction("Are you sure you want to delete this shift permanently?", {action:{abort:"Cancel", submit:"Delete"}}).subscribe(res=>{
      if(res === 'confirm'){
        this.shiftService.deleteShift(id).subscribe(res=>{
          console.log("Delete Shift Response:",res)
          if(res.data === null){
            this.dynamicComponentsService.loadFeedback("Deleted Successfully", {duration:2000})
          } else{

            this.dynamicComponentsService.loadFeedback("Failed to delete shift", {duration:2500})
          }
        })
      }
    })
  }

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.shifts.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
