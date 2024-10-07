import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffShift, User } from '../../../interfaces/interfaces';
import { ShiftsService } from '../../../services/shifts/shifts.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, DatePipe, PaginatorComponent],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.css'
})
export class ShiftsComponent implements OnInit{
  shifts!:StaffShift[]
  currentPage:number = 1
  pageSize: number = 1
  displayedData:StaffShift[] = []
  showPag:boolean = false
  totalPages:number = 1
  noRecords:string = 'No records found'

  
  constructor(
    private activatedRoute:ActivatedRoute,
    private shiftService:ShiftsService
  ){}



  ngOnInit(): void {
      this.fetchData()
  }

  fetchData(){
    this.activatedRoute.params.subscribe(params=>{
      if(params['id']){
        const id = params['id']
        this.shiftService.fetch()
          this.shiftService.staffShifts$.subscribe(res=>{
            this.shifts = res.filter(i=>i.user.id === id)
            this.pageSize = 10
            this.totalPages = (Math.ceil((this.shifts?.length)/this.pageSize))
            this.currentPage = 1
            this.showPag = this.totalPages > 1?true:false
            this.updateDisplay()
          })
      }
    })
  }


  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.shifts?.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
