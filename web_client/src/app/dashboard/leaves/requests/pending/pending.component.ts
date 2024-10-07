import { Component, OnInit } from '@angular/core';
import { LeaveService } from '../../../services/leaves/leave.service';
import { LeavesResponse } from '../../../interfaces/interfaces';
import { AuthService } from '../../../../auth/auth.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { DynamicComponentsService } from '../../../../utilities/components/dynamic-components/dynamic-components.service';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [NgFor, DatePipe, FormsModule, PaginatorComponent, NgIf, SpinnerComponent],
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingComponent implements OnInit {
  applications: LeavesResponse[] = []
  organizationId: string = ''
  searchString:string = ''
  displayedData:LeavesResponse[] = []
  showPag:boolean = false
  currentPage:number = 1
  totalPages:number = 1
  pageSize:number = 10
  noRecords:string = 'No records found'
  showSpinner:boolean = false


  constructor(
    private leaveService: LeaveService,
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentsService
  ) { }

  ngOnInit(): void {
    this.fetchData()
  }

  fetchData() {
    this.showSpinner = true
    this.authService.currentUser$.subscribe(res => {
      if (res?.id) {
        this.organizationId = res.user_organization.organization.id
        this.leaveService.fetch()
        this.leaveService.leaveApplications$.subscribe(apps => {
          this.applications = apps?.filter(a => a.application.user.user_organization.organization.id === this.organizationId && a.status.toLowerCase().trim() === 'pending') as LeavesResponse[]
          this.pageSize = 10
          this.totalPages = (Math.ceil((this.applications?.length)/this.pageSize))
          this.currentPage = 1
          this.showPag = this.totalPages > 1?true:false
          this.showSpinner = false
          this.updateDisplay()
        })
      }
    })
  }

  approve(id: string) {
    this.dynamicComponentService.confirmAction("Are you sure you want to decline this request?", { action: { abort: "cancel", submit: 'Confirm' } }).subscribe(res => {
      if (res === 'confirm') {
        this.leaveService.updateApplicationStatus(id, "approved").subscribe(res => {
          if (res.data.id) {
            this.dynamicComponentService.loadFeedback("Approved Successfully", { duration: 2000 })
          } else {
            this.dynamicComponentService.loadFeedback("Failed to approve", { duration: 2500 })
          }
        })
      }
    })
  }

  reject(id: string) {
    this.dynamicComponentService.confirmAction("Are you sure you want to approve this request?", { action: { abort: "cancel", submit: 'Confirm' } }).subscribe(res => {
      if (res === 'confirm') {
        this.leaveService.updateApplicationStatus(id, "rejected").subscribe(res => {
          if (res.data.id) {
            this.dynamicComponentService.loadFeedback("Rejected Successfully", { duration: 2000 })
          } else {
            this.dynamicComponentService.loadFeedback("Failed to reject", { duration: 2500 })
          }
        })
      }
    })
  }

  filter() {
    this.leaveService.fetch()
    this.leaveService.leaveApplications$.subscribe(apps => {
      this.applications = apps?.filter(a => a.application.user.user_organization.organization.id === this.organizationId && a.status.toLowerCase().trim() === 'pending') as LeavesResponse[]
      const data: LeavesResponse[] = apps?.filter(i => {
        let str: string = this.searchString.toLowerCase().trim()
        return (
          i.application.user.first_name.toLowerCase().trim().includes(str) ||
          i.application.user.middle_name.toLowerCase().trim().includes(str) ||
          i.application.user.last_name.toLowerCase().trim().includes(str) ||
          i.application.user.email.toLowerCase().trim().includes(str) ||
          i.application.user.staff_number.toLowerCase().trim().includes(str) ||
          i.application.user.id_number?.toLowerCase().trim().includes(str) ||
          i.application.user.user_organization?.branch.name.toLowerCase().trim().includes(str)
        )
      }) as LeavesResponse[]
      this.applications = data
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
}
