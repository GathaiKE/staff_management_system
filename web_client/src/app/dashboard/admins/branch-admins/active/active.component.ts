import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicComponentsService } from '../../../../utilities/components/dynamic-components/dynamic-components.service';
import { Router } from '@angular/router';
import { NewAdmin, User, UserFormData } from '../../../interfaces/interfaces';
import { CommonModule, NgFor } from '@angular/common';
import { StaffService } from '../../../services/staff/staff.service';
import { AuthService } from '../../../../auth/auth.service';
import { FormComponent } from '../../../../utilities/components/dynamic-components/form/form.component';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-active',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor, FormComponent, CommonModule, PaginatorComponent, MatTooltipModule, SpinnerComponent],
  templateUrl: './active.component.html',
  styleUrl: './active.component.css'
})
export class ActiveComponent implements OnInit{
  adminForm!: FormGroup
  formConfig: { [key: string]: { label?: string, type: string, options?: string[] } } = {
    filterText: { label: 'Search user by name, ID number, staff number...', type: 'text' },
    id:{type:'hidden'}
  };
  showForm:boolean = false
  submit: string = 'Appoint'
  title: string = 'Make Branch Admin'
  abort: string = 'Cancel'
  size: string = 'fit'
  currentUser!: User
  admins!: User[]
  staff!:User[]
  searchString:string = ''
  currentPage:number = 1
  displayedData:User[] = []
  totalPages:number = 1
  pageSize:number = 1
  showPag:boolean = false
  unfilteredAdmins:User[] = []
  noRecords:string = 'No Records Found'
  showSpinner:boolean = false


  constructor(
    private dynamicComponentSevice: DynamicComponentsService,
    private staffServce: StaffService,
    private authService: AuthService,
    private fb:FormBuilder,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.fetchData()
    this.initForm()
  }
  getFormValue(value:any){
    if(value.id){
        const user:User = this.staff.find(u=>u.id === value.id) as User
        const payload:NewAdmin = {
          is_assistant_superadmin:user.is_assistant_superadmin,
          is_branchadmin:true,
          is_buildingadmin:user.is_buildingadmin,
          is_organizationadmin:user.is_organizationadmin
        }
        if(user.is_branchadmin){
          this.dynamicComponentSevice.loadFeedback(`${user.first_name} ${user.middle_name} ${user.last_name} is already an branch admin`, {duration:2500})
        }else{
          this.staffServce.updateUser(value.id, payload).subscribe(res=>{
            if(res.data.id){
              this.dynamicComponentSevice.loadFeedback(`${user.first_name} ${user.middle_name} ${user.last_name} is now an branch admin`, {duration:2500})
            } else{
              this.dynamicComponentSevice.loadFeedback(`Failed to make ${user.first_name} ${user.middle_name} ${user.last_name} a branch admin`, {duration:2500})
            }
          })
        }
    }
  }
  closeForm(){
    this.showForm = false
  }

  register() {
    this.showForm = true
  }

  details(id:string){
    this.router.navigate(['user', {id:id}])
  }


  fetchData() {
    this.showSpinner = true
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(res => {
      this.currentUser = res as User
      this.staffServce.fetchStaff()
      this.staffServce.staffData$.subscribe(users =>{
        this.admins = users.filter(user=>user.is_branchadmin && user.is_active && user.user_organization.organization.id === this.currentUser.user_organization.organization.id)
        this.unfilteredAdmins = users.filter(user=>user.is_branchadmin && user.is_active && user.user_organization.organization.id === this.currentUser.user_organization.organization.id)
        this.staff = users
        this.pageSize = 10
        this.totalPages = (Math.ceil((this.admins.length)/this.pageSize))
        this.currentPage = 1
        this.showPag = this.totalPages > 1?true:false
        this.showSpinner = false
        this.updateDisplay()
      })
    })
  }

  initForm() {
    this.adminForm = this.fb.group({
      filterText: [''],
      id:['']
    })
  }

  filter() {
    const data: User[] = this.unfilteredAdmins.filter(i => {
      let str: string = this.searchString.toLowerCase().trim()
      console.log(str);
      
      return (
        i.first_name.toLowerCase().trim().includes(str) ||
        i.middle_name.toLowerCase().trim().includes(str) ||
        i.last_name.toLowerCase().trim().includes(str) ||
        i.email.toLowerCase().trim().includes(str) ||
        i.staff_number.toLowerCase().trim().includes(str) ||
        i.staff_department?.toLowerCase().trim().includes(str) ||
        i?.user_organization?.branch.name.toLowerCase().trim().includes(str)
      )
    })
    this.admins = data.filter(user=>user.is_organizationadmin)
    this.updateDisplay()
}
  
  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.admins.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
