import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../utilities/components/header/header.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewOrganization, OrganizationFormData } from '../interfaces/interfaces';
import { DynamicComponentsService } from '../../utilities/components/dynamic-components/dynamic-components.service';
import { OrganizationService } from '../services/organization/organization.service';
import { DualRowFormComponent } from '../../utilities/components/dynamic-components/dual-row-form/dual-row-form.component';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [SidenavComponent, HeaderComponent, RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule, DualRowFormComponent],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.css'
})
export class OrganizationsComponent implements OnInit{
constructor(
  private router:Router,
  private dynamicComponentService:DynamicComponentsService,
  private organizationService:OrganizationService,
  private fb:FormBuilder
){}
ngOnInit(): void {
  this.router.navigate(['organizations/all'])
  this.initForm()
}

activeRoute(route:string){
  return this.router.isActive(route, true)
}

navigate(route:string){
  this.router.navigate([route])
}

registerOrganizationForm!:FormGroup<any>
initForm(){
  this.registerOrganizationForm = this.fb.group({
    orgName:['', [Validators.required]],
    address:['', [Validators.required]],
    phoneNumber:['',[Validators.required]],
    email:['',[Validators.required, Validators.email]],
    status:[true]
  })
}

formConfig: { [key: string]: { label?: string, type: string, options?: any[] } } = {
  orgName: { label: 'Organization Name', type: 'text' },
  address: { label: 'Physical Address', type: 'text' },
  phoneNumber: { label: 'Contact', type: 'text' },
  email: { label: 'Email', type: 'email' }
}
showForm:boolean = false
openForm(){
  this.showForm = true
}
closeForm(){
  this.showForm = false
}

getFormValue(value:any){

  const formData:OrganizationFormData = value
  let phone:string = (formData.phoneNumber)
  let phone_number_chars = phone.slice(-9)
  let phoneNumber:string = `254`+ phone_number_chars

  const payload:NewOrganization = {
    name:formData.orgName,
    organization_email:formData.email,
    organization_location:formData.address,
    organization_tel:phoneNumber,
    status:formData.status
  }

  this.organizationService.registerOrganization(payload).subscribe(res=>{
    if(res.data.id){
      this.dynamicComponentService.loadFeedback("Registration Successfull", {duration:2500, action:{abort:"Close"}})
    } else{
      this.dynamicComponentService.loadFeedback("Registration Failed", {duration:2500, action:{abort:"Close"}})
    }
  })

}
}
