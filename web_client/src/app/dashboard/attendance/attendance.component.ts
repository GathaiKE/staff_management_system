import { Component, OnInit, Signal, computed } from '@angular/core';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../utilities/components/header/header.component';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { Branch, CheckInData, User } from '../interfaces/interfaces';
import { StaffService } from '../services/staff/staff.service';
import { FilterService } from '../services/filter/filter.service';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../services/branch/branch.service';
import { jsPDF } from 'jspdf'
import autoTable, { UserOptions as options } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ExportService } from '../services/export/export.service';


@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [SidenavComponent, HeaderComponent, DatePipe, NgClass, RouterOutlet, NgFor, FormsModule, NgIf],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnInit {
  today: Date = new Date()
  data: CheckInData[] = []
  totalLate: number = 0
  totalOntime: number = 0
  totalCheckins: number = 0
  dateFilter: string = ''
  branches: Branch[] = []
  displayDatePretext: string = 'Today'
  exportData: CheckInData[] = []

  constructor(
    private router: Router,
    private staffService: StaffService,
    private filterSercvice: FilterService,
    private branchService: BranchService,
    private exportService:ExportService,
    private authService:AuthService
  ) { }

  ngOnInit(): void {
    this.fetchData()
    this.router.navigate(['attendance/all'])
  }


  activeRoute(route: string) {
    return this.router.isActive(route, true)
  }

  navigate(route: string) {
    this.router.navigate([route])
  }


  fetchData() {
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>{

    this.staffService.getCheckinData()
    this.staffService.checkinData$.subscribe(res => {
      this.data = res
      this.filterSercvice.attendanceFilterSub.next(this.data)
      this.exportData = this.data.slice()
      this.totalCheckins = this.data.length
      this.totalLate = Math.trunc(this.totalCheckins * 1 / 3)
      this.totalOntime = Math.trunc(this.totalCheckins * 2 / 3)
    })
    this.branchService.fetch()
    this.branchService.branches$.subscribe(res => this.branches = res?.filter(b=>b.organization?.id === user?.user_organization?.organization?.id) as Branch[])
    this.today = new Date()
    this.displayDatePretext = 'Today'

    })
  }

  filterField(filterString: string): void {
    const text: string = filterString.toLowerCase().trim()
    const data = this.data.filter(i => {
      return (i.user.first_name.toLowerCase().trim().includes(text) ||
        i.user.first_name.toLowerCase().trim().includes(text) ||
        i.user.middle_name.toLowerCase().trim().includes(text) ||
        i.user.last_name.toLowerCase().trim().includes(text) ||
        i.user.email.toLowerCase().trim().includes(text) ||
        i.user.staff_number.toLowerCase().trim().includes(text) ||
        i.user.staff_department?.toLowerCase().trim().includes(text) ||
        i.user.user_organization.branch.name.toLowerCase().trim().includes(text))
    })
    this.filterSercvice.attendanceFilterSub.next(data)
    this.exportData = data.slice()
  }

  filterByDate(event: Event): void {
    const value: string = (event.target as HTMLInputElement).value
    let date = new Date(value);
    let filteredRecords = this.data.filter(record => {
      let recordDate = new Date(record.checkin_time);
      return recordDate.toDateString() === date.toDateString();
    });
    this.filterSercvice.attendanceFilterSub.next(filteredRecords)
    this.exportData = filteredRecords.slice()
    this.today = date
    this.displayDatePretext = date === new Date() ? 'Today' : 'Date'
  }

  filterByBranch(event: Event | null): void {
    const value: string = (event?.target as HTMLSelectElement).value
    if (value) {
      const data: CheckInData[] = this.data.filter(i => i.user.user_organization.branch.id === value.toLowerCase().trim())
      this.filterSercvice.attendanceFilterSub.next(data)
      this.exportData = data.slice()
    } else {
      const data: CheckInData[] = this.data
      this.filterSercvice.attendanceFilterSub.next(data)
      this.exportData = data.slice()
    }
  }

  exportCheckinRecords(): void {
    this.exportService.exportToExcel(this.exportData, 'data.xlsx');
  }

  
}