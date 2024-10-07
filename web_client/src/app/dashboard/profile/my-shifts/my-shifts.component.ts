import { Component, OnInit } from '@angular/core';
import { Shift, StaffShift } from '../../interfaces/interfaces';
import { AuthService } from '../../../auth/auth.service';
import { ShiftsService } from '../../services/shifts/shifts.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-my-shifts',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, NgClass, SpinnerComponent],
  templateUrl: './my-shifts.component.html',
  styleUrl: './my-shifts.component.css'
})
export class MyShiftsComponent implements OnInit{
  shifts!:StaffShift[]
  displayedData:StaffShift[] = []
  currentPage:number = 1
  pageSize:number = 1
  totalPages:number =1
  showPag:boolean = false
  noRecords:string = 'No records found'
  showSpinner:boolean = false


  constructor(
    private authService:AuthService,
    private shiftService:ShiftsService
  ){}

  ngOnInit(): void {
      this.fetchData()
  }

  fetchData(){
    this.showSpinner = true
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>{
      if(user?.id){
          this.shiftService.fetch()
          this.shiftService.staffShifts$.subscribe(res=>{
            this.shifts = res.filter(i=>i.user.id === user.id)
            this.pageSize = 10
            this.totalPages = (Math.ceil((this.shifts.length)/this.pageSize))
            this.currentPage = 1
            this.showPag = this.totalPages > 1?true:false
            this.showSpinner = false
            this.updateDisplay()
          })
      }
    })
  }

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.shifts?.slice(startIndex, endIndex)
  }
  
  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
