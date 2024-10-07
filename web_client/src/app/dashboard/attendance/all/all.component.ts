import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CheckInData, User } from '../../interfaces/interfaces';
import { StaffService } from '../../services/staff/staff.service';
import { FilterService } from '../../services/filter/filter.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-all',
  standalone: true,
  imports: [NgFor, NgClass, DatePipe, NgIf, MatTooltipModule, FormsModule, PaginatorComponent, SpinnerComponent],
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})
export class AllComponent implements OnInit {
  data: CheckInData[] = []
  displayedData:CheckInData[] = []
  searchString: string = ''
  currentPage:number = 1
  showPag:boolean = false
  totalPages:number = 0
  pageSize:number = 10
  noRecords:string = 'No records found'
  showSpinner:boolean =  false

  constructor(
    private staffService: StaffService,
    private filterService: FilterService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.fetchData()
  }

  filter() {
    this.staffService.checkinData$.subscribe(res => {
      const data: CheckInData[] = res.filter(i => {
        let str: string = this.searchString.toLowerCase().trim()
        return (
          i.user.first_name.toLowerCase().trim().includes(str) ||
          i.user.middle_name.toLowerCase().trim().includes(str) ||
          i.user.last_name.toLowerCase().trim().includes(str) ||
          i.user.email.toLowerCase().trim().includes(str) ||
          i.user.staff_number.toLowerCase().trim().includes(str) ||
          i.user.staff_department?.toLowerCase().trim().includes(str) ||
          i.user.user_organization.branch.name.toLowerCase().trim().includes(str)
        )
      })
      if(data.length === 0){
        this.noRecords = "No matching records"
      }
      this.filterService.attendanceFilterSub.next(data)
      this.updateDisplay()
    })
  }

  fetchData() {
    this.showSpinner = true
    this.filterService.attendanceData$.subscribe(res => {
      this.data = res
      this.pageSize = 10
      this.totalPages = (Math.ceil((this.data.length)/this.pageSize))
      this.currentPage = 1
      this.showPag = this.totalPages > 1?true:false
      this.showSpinner = false
      this.updateDisplay()
    })
  }


  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.data.slice(startIndex, endIndex)
  }

  details(id:string){
    this.router.navigate(['user', {id:id}])
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
