import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NewOrganization, Organization, UpdatedOrganizationFormData } from '../../interfaces/interfaces';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrganizationService } from '../../services/organization/organization.service';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';
import { BranchService } from '../../services/branch/branch.service';
import { StaffService } from '../../services/staff/staff.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DualRowFormComponent } from '../../../utilities/components/dynamic-components/dual-row-form/dual-row-form.component';

@Component({
  selector: 'app-organization-details',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, RouterOutlet, CommonModule, DualRowFormComponent],
  templateUrl: './organization-details.component.html',
  styleUrl: './organization-details.component.css'
})
export class OrganizationDetailsComponent implements OnInit{
  organization!:Organization
  branches: number = 0
  buildings: number = 0
  staff: number = 0
  updateOrganizationForm!:FormGroup<any>
  showForm:boolean = false

  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private organizationsService:OrganizationService,
    private dynamicComponentService:DynamicComponentsService,
    private branchesService:BranchService,
    private staffService:StaffService,
    private fb:FormBuilder
    ){}
  
  ngOnInit(): void {
    this.extractData()
    if(this.organization){
      this.router.navigate(['organization/branches', {id:this.organization.id}])
    }
  }

  extractData(){
    this.organizationsService.getOrganizations()
    this.route.params.subscribe(params=>{
      if(params['id']){
        const orgId:string = params['id'] as string
        this.organizationsService.organizations$.subscribe(orgs=>{
          this.organization = orgs.find(o=>o.id === orgId) as Organization
          this.initForm()
        })
        this.branchesService.fetch()
        this.branchesService.branches$.subscribe(branches=>this.branches = branches?branches?.filter(b=>b.organization.id === orgId).length:0)
        this.staffService.fetchStaff()
        this.staffService.staffData$.subscribe(staff=>this.staff = staff.filter(u=>u.user_organization.organization?.id === orgId).length)
        this.buildings = this.branches
      }
    })
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
  
  navigate(route:string){
    this.router.navigate([route, {id:this.organization.id}])
  }
  
initForm(){
  this.updateOrganizationForm = this.fb.group({
    orgName:[this.organization.name, [Validators.required]],
    address:[this.organization.organization_location, [Validators.required]],
    phoneNumber:[this.organization.organization_tel,[Validators.required]],
    email:[this.organization.organization_email,[Validators.required, Validators.email]],
  })
}

formConfig: { [key: string]: { label?: string, type: string, options?: any[] } } = {
  orgName: { label: 'Organization Name', type: 'text'},
  address: { label: 'Physical Address', type: 'text'},
  phoneNumber: { label: 'Contact', type: 'text'},
  email: { label: 'Email', type: 'email'}
}
openForm(){
  this.showForm = true
}
closeForm(){
  this.showForm = false
}

getFormValue(value:any){
  const payload:NewOrganization = {
    name:value.orgName,
    organization_email:value.email,
    organization_location:value.address,
    organization_tel:value.phoneNumber,
    status:true
  }
  this.organizationsService.updateOrganization(payload, this.organization.id).subscribe(res=>{
    if(res.data.id){
      this.dynamicComponentService.loadFeedback("Update Successfull", {duration:2000})
    } else{
      this.dynamicComponentService.loadFeedback(`Error:${res.error.error}`, {duration:2500})
    }
  })
}
}
