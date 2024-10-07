import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../utilities/components/header/header.component';
import { DynamicComponentsService } from '../../utilities/components/dynamic-components/dynamic-components.service';
import { Branch, NewStaff, Organization, User, UserFormData } from '../interfaces/interfaces';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StaffService } from '../services/staff/staff.service';
import { AuthService } from '../../auth/auth.service';
import { BranchService } from '../services/branch/branch.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { DualRowFormComponent } from '../../utilities/components/dynamic-components/dual-row-form/dual-row-form.component';
import { OrganizationService } from '../services/organization/organization.service';



@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [SidenavComponent, HeaderComponent, FormsModule, ReactiveFormsModule, NgFor, RouterOutlet, NgClass, DualRowFormComponent, NgIf],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.css'
})
export class StaffComponent implements OnInit{
    organizationId:string = ''
    branches:Branch[] = []
    private branchFetchErr?:string =''
    staffData:User[] = []
    activeStaff:number = 0
    suspendedStaff:number = 0
    staffOnLeave:number = 0
    totalStaff:number = 0
    fetchStaffErr?:string = ''
    user:User | null = null
    organizations:Organization[] = []
    showOrgSelect:boolean = false

  constructor(
    private dynamicComponentService:DynamicComponentsService,
    private staffService:StaffService,
    private authService:AuthService,
    private branchService:BranchService,
    private router:Router,
    private fb:FormBuilder,
    private organizationServie:OrganizationService
    ){}

    ngOnInit(): void {
      this.navigate('staff/all-staff')
      this.fetchData()
      this.initForm()
    }

    fetchData(){
      this.getActiveUser()
      this.branchService.fetch()
      this.branchService.branches$.subscribe(res=>{
        this.branches = res as Branch[]
      })
      this.branchService.branchesErr$.subscribe(res=>{
        this.branchFetchErr = res?.error
      })
        this.authService.currentUser$.subscribe(user=>{
          const orgId:string | undefined = user?.user_organization?.organization.id
          if(orgId){
            this.organizationId = orgId
          }
          if(user?.is_assistant_superadmin || user?.is_superuser){
            this.organizationServie.getOrganizations()
            this.organizationServie.organizations$.subscribe(res=>this.organizations = res)
            this.showOrgSelect = true
          }
        })

        this.staffService.staffData$.subscribe(res=>{
          this.staffData = res
          this.totalStaff = this.staffData.length
          this.activeStaff = this.staffData.filter(s=>s.is_active).length
          this.suspendedStaff = this.staffData.filter(s=>!s.is_active).length
          this.staffOnLeave = this.staffData.filter(s=>s.is_active).length
        })

        this.staffService.staffFetchErr$.subscribe(res=>this.fetchStaffErr = res)
    }

  getActiveUser(){
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>{
      this.user = user
    })
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }

  showForm = false

  openForm(){
    this.showForm = true
  }

  registerForm!:FormGroup
  initForm(){
        this.registerForm = this.fb.group({
          firstName: ['', [Validators.required]],
          middleName: ['', [Validators.required]],
          lastName: [''],
          email: [''],
          dob: [''],
          phoneNumber: [''],
          address: [''],
          branch: [''],
          department: [''],
          password: [''],
          staffNumber:[''],
          idNumber:['']
        });  
  }

  close(){
    this.showForm = false
  }

  getFormValue(value:any){
    
    const formData:UserFormData = value
    const organization:string=  this.user?.user_organization?.organization.id as string
    let phone:string = (formData.phoneNumber)
      let phone_number_chars = phone.slice(-9)
      let phoneNumber:string = `254`+ phone_number_chars

      const formatedDob:string = formData.dob.length > 9?new Date(formData.dob).getFullYear()+'-'+new Date(formData.dob).getMonth().toString().padStart(2, "0")+'-'+new Date(formData.dob).getDate().toString().padStart(2, "0") : formData.dob
      

      const payload:NewStaff ={
        first_name:formData.firstName,
        middle_name:formData.middleName,
        last_name:formData.lastName,
        email:formData.email,
        phone_number:phoneNumber,
        password:formData.password,
        staff_department:formData.department,
        organization: formData?.organization?formData?.organization:organization,
        user_dob:formatedDob,
        user_address:formData.address,
        is_assistant_superadmin:false,
        is_branchadmin:false,
        is_buildingadmin:false,
        is_organizationadmin:false,
        is_staff:true,
        is_superuser:false,
        staff_number:formData.staffNumber,
        id_number:formData.idNumber,
        profile_pic:null,
        staff_status:true,
        branch:formData.branch
      }

      this.staffService.registerStaff(payload).subscribe((res)=>{
        if(res.data.id){
          this.dynamicComponentService.loadFeedback("Registration Successfull", {duration:2000, action:{abort:"Close"}})
          this.fetchData()
        } else{
          this.dynamicComponentService.loadFeedback("Could not add user at this time!", {duration:2500, action:{abort:"Close"}})
        }
      })
      
  }


  formConfig: { [key: string]: { label?: string, type: string, options?: any[] } } = {
    firstName: { label: 'First Name', type: 'text' },
    middleName: { label: 'Middle Name', type: 'text' },
    lastName: { label: 'Last Name.', type: 'text' },
    staffNumber: { label: 'Staff Number', type: 'text' },
    idNumber: { label: 'ID number', type: 'text' },
    email: { label: 'email', type: 'email' },
    dob: { label: 'Date Of Birth', type: 'date' },
    phoneNumber: { label: 'Phone', type: 'text' },
    address: { label: 'Current Address', type: 'text' },
    branch: { label: 'Branch', type: 'select'},
    department: { label: 'Department', type: 'text' },
    password: { label: 'Password', type: 'password' }
  };
  
}