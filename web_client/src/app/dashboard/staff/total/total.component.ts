import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { User } from '../../interfaces/interfaces';
import { AuthService } from '../../../auth/auth.service';
import { StaffService } from '../../services/staff/staff.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import {  FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-total',
  standalone: true,
  imports: [NgFor, MatTooltipModule, NgIf, PaginatorComponent, FormsModule, SpinnerComponent],
  templateUrl: './total.component.html',
  styleUrl: './total.component.css'
})
export class TotalComponent {
  staffData:User[] = []
  rawStaffdata:User[] = []
  organizationId:string =''
  error?:string =''
  userId:string = ''
  searchString:string = ''
  currentPage:number = 1
  pageSize:number = 1
  totalPages:number =1
  displayedData:User[] = []
  showPag:boolean = false
  noRecords:string = 'No records found'
  showSpinner:boolean = false
  

  constructor(
    private authService:AuthService,
    private staffService:StaffService,
    private router:Router
  ){
    this.fetchData()
  }

  fetchData(){
    this.showSpinner = true
    this.userId = localStorage.getItem("user")??localStorage.getItem("user") as string
    this.getActiveUser()
      this.authService.currentUser$.subscribe(user=>{
        this.organizationId = user?.user_organization?.organization.id?user?.user_organization?.organization.id:""
      })
      this.staffService.fetchStaff()
      this.staffService.staffData$.subscribe(res=>{
        this.staffData = res
        this.rawStaffdata = res
        this.pageSize = 5
        this.totalPages = (Math.ceil((this.staffData.length)/this.pageSize))
        this.currentPage = 1
        this.showPag = this.totalPages > 1?true:false
        this.updateDisplay()
        this.showSpinner = false
      }
      )
      this.staffService.staffFetchErr$.subscribe(res=>this.error = res)
  }

  getActiveUser(){
    this.authService.currentUser$.subscribe(user=>this.organizationId = user?.user_organization?.organization.id?user?.user_organization?.organization.id:"")
  }

  getDetails(user:User){
    this.router.navigate(['user', {id:user.id}])
  }

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.staffData.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }

  filter() {
    const staff:User[] = this.rawStaffdata as User[]
    const data: User[] = staff.filter(i => {
      let str: string = this.searchString.toLowerCase().trim()
      return (
        i.first_name?.toLowerCase().trim().includes(str) ||
        i.middle_name?.toLowerCase().trim().includes(str) ||
        i.last_name?.toLowerCase().trim().includes(str) ||
        i.staff_number?.toLowerCase().trim().includes(str) ||
        i.email?.toLowerCase().trim().includes(str) || 
        i.staff_department?.toLowerCase().trim().includes(str))
    })
    this.staffData = data
    this.updateDisplay()
}
}
