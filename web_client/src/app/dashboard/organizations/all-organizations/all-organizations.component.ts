import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationService } from '../../services/organization/organization.service';
import { Organization } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-all-organizations',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorComponent, SpinnerComponent],
  templateUrl: './all-organizations.component.html',
  styleUrl: './all-organizations.component.css'
})
export class AllOrganizationsComponent implements OnInit{
  unfilteredOrganizations!:Organization[]
  organizations!:Organization[]
  fetchError?:string
  searchString:string = ''
  currentPage:number = 1
  pageSize:number = 1
  totalPages:number =1
  displayedData:Organization[] = []
  showPag:boolean = false
  showSpinner:boolean = false
  noRecords:string = 'No records found'

  constructor(private router:Router, private organizationService:OrganizationService){}
  ngOnInit(): void {
    this.fetchData()
  }
  
  fetchData(){
    this.showSpinner = true
    this.organizationService.getOrganizations()
    this.organizationService.organizations$.subscribe(orgs=>{
      this.organizations = orgs
      this.unfilteredOrganizations = orgs
      this.pageSize = 10
      this.totalPages = (Math.ceil((this.organizations.length)/this.pageSize))
      this.currentPage = 1
      this.showPag = this.totalPages > 1?true:false
      this.showSpinner = false
      this.updateDisplay()
    })
    this.organizationService.organizationsErr$.subscribe(err=>{
      this.fetchError = err?.error
    })
  }

  navigate(route:string){
    this.router.navigate([route])
  }


  getDetails(organization:Organization){
    if(organization){
      this.router.navigate(['organization', {id:organization.id}])}
  }

  filter() {
      const admins:Organization[] = this.unfilteredOrganizations as Organization[]
      const data: Organization[] = admins.filter(i => {
        let str: string = this.searchString.toLowerCase().trim()
        return (
          i.org_identifier.toLowerCase().trim().includes(str) ||
          i.organization_email.toLowerCase().trim().includes(str) ||
          i.organization_location.toLowerCase().trim().includes(str) ||
          i.organization_tel.toLowerCase().trim().includes(str) ||
          i.name.toLowerCase().trim().includes(str)
        )
      })
      this.organizations = data
  }
  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.organizations.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
