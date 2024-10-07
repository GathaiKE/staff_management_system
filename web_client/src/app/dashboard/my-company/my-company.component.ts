import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NewOrganization, Organization, UpdatedOrganizationFormData, UserFormData } from '../interfaces/interfaces';
import { DynamicComponentsService } from '../../utilities/components/dynamic-components/dynamic-components.service';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../utilities/components/header/header.component';
import { AuthService } from '../../auth/auth.service';
import { OrganizationService } from '../services/organization/organization.service';
import { BranchService } from '../services/branch/branch.service';
import { StaffService } from '../services/staff/staff.service';
import { SpinnerComponent } from '../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-my-company',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterOutlet, SidenavComponent, HeaderComponent, SpinnerComponent],
  templateUrl: './my-company.component.html',
  styleUrl: './my-company.component.css'
})
export class MyCompanyComponent implements OnInit{
  organization!:Organization
  companyId:string = ''
  branches: number = 0
  buildings: number = 0
  staff: number = 0
  showSpinner:boolean = false

  constructor(
    private router:Router,
    private dynamicComponentService:DynamicComponentsService,
    private authService:AuthService,
    private organizationService:OrganizationService,
    private branchesService:BranchService,
    private staffService:StaffService
    ){}
    
    ngOnInit(): void {
      this.showSpinner = true
      this.authService.activeUser()
      this.authService.currentUser$.subscribe(res=>{
        if(res?.user_organization?.organization){
          this.companyId = res?.user_organization?.organization?.id
          this.organizationService.getOrganizations()
          this.organizationService.organizations$.subscribe(orgs=>{
            this.organization = orgs.find(o=>o.id === this.companyId) as Organization
            this.showSpinner = false
          })
          this.branchesService.fetch()
          this.branchesService.branches$.subscribe(branches=>this.branches = branches?branches?.filter(b=>b.organization.id === this.companyId).length:0)
          this.staffService.fetchStaff()
          this.staffService.staffData$.subscribe(staff=>this.staff = staff.filter(u=>u.user_organization.organization.id === this.companyId).length)
          this.buildings = this.branches
        }
      })
      this.router.navigate(['my-company/branches'])
  }
  
  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }

  updateCompany(){
    this.dynamicComponentService.loadForm({activeForm:"updateOrganization",size:'fit', title:'Update Company Profile', duration:'2500',action:{abort:'Cancel', submit:'Update'}, data:{org:this.organization}}).subscribe((res:UpdatedOrganizationFormData)=>{
      const payload:NewOrganization = {
        name:res.orgName,
        organization_email:res.email,
        organization_location:res.address,
        organization_tel:res.phoneNumber,
        status:true
      }

      this.organizationService.updateOrganization(payload, this.organization.id).subscribe(res=>{
        if(res.data.id){
          this.dynamicComponentService.loadFeedback("Update Successfull", {duration:2000})
        } else{
          this.dynamicComponentService.loadFeedback(`Error:${res.error.error}`, {duration:2500})
        }
      })
    })
  }

}
