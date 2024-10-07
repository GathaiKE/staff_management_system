import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { LeaveService } from '../../../services/leaves/leave.service';
import { LeavesResponse } from '../../../interfaces/interfaces';
import { DynamicComponentsService } from '../../../../utilities/components/dynamic-components/dynamic-components.service';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-approved',
  standalone: true,
  imports: [DatePipe, NgFor, FormsModule, NgIf, PaginatorComponent, SpinnerComponent],
  templateUrl: './approved.component.html',
  styleUrl: './approved.component.css'
})
export class ApprovedComponent {
  applications: LeavesResponse[] = []
  organizationId: string = ''
  searchString: string = ''
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
          this.applications = apps?.filter(a => a.application.user.user_organization.organization.id === this.organizationId && a.status.toLowerCase().trim() === 'approved') as LeavesResponse[]
          this.pageSize = 10
          this.totalPages = (Math.ceil((this.applications.length)/this.pageSize))
          this.currentPage = 1
          this.showPag = this.totalPages > 1?true:false
          this.showSpinner = false
          this.updateDisplay()

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
      this.applications = apps?.filter(a => a.application.user.user_organization.organization.id === this.organizationId && a.status.toLowerCase().trim() === 'approved') as LeavesResponse[]
      const data: LeavesResponse[] = apps?.filter(i => {
        let str: string = this.searchString.toLowerCase().trim()
        return (i.application.user.first_name.toLowerCase().trim().includes(str) ||
          i.application.user.middle_name.toLowerCase().trim().includes(str) ||
          i.application.user.last_name.toLowerCase().trim().includes(str) ||
          i.application.user.email.toLowerCase().trim().includes(str) ||
          i.application.user.staff_number.toLowerCase().trim().includes(str) ||
          i.application.user.id_number?.toLowerCase().trim().includes(str) ||
          i.application.user.user_organization?.branch.name.toLowerCase().trim().includes(str))
      }) as LeavesResponse[]
      this.applications = data
    })

  }

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.applications.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
