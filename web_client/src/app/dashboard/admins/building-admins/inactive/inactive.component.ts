import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewAdmin, User, UserFormData } from '../../../interfaces/interfaces';
import { DynamicComponentsService } from '../../../../utilities/components/dynamic-components/dynamic-components.service';
import { CommonModule, NgFor } from '@angular/common';
import { StaffService } from '../../../services/staff/staff.service';
import { AuthService } from '../../../../auth/auth.service';
import { Router } from '@angular/router';
import { FormComponent } from '../../../../utilities/components/dynamic-components/form/form.component';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';

@Component({
  selector: 'app-inactive',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgFor, FormComponent, CommonModule, PaginatorComponent],
  templateUrl: './inactive.component.html',
  styleUrl: './inactive.component.css'
})
export class InactiveComponent implements OnInit{
  adminForm!: FormGroup
  formConfig: { [key: string]: { label?: string, type: string, options?: string[] } } = {
    filterText: { label: 'Search for user by name, email, staff no...', type: 'text' },
    id:{type:'hidden'}
  };
  showForm:boolean = false
  submit: string = 'Appoint'
  title: string = 'Make Building Admin'
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
          is_assistant_superadmin:true,
          is_branchadmin:user.is_branchadmin,
          is_buildingadmin:user.is_buildingadmin,
          is_organizationadmin:user.is_organizationadmin
        }
        if(user.is_assistant_superadmin){
          this.dynamicComponentSevice.loadFeedback(`${user.first_name} ${user.middle_name} ${user.last_name} is already a building admin`, {duration:2500})
        }else{
          this.staffServce.updateUser(value.id, payload).subscribe(res=>{
            console.log("MakeAdminRes:", res)
            if(res.data.id){
              this.dynamicComponentSevice.loadFeedback(`${user.first_name} ${user.middle_name} ${user.last_name} is now a building admin`, {duration:2500})
            } else{
              this.dynamicComponentSevice.loadFeedback(`Failed to make ${user.first_name} ${user.middle_name} ${user.last_name} a building admin`, {duration:2500})
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
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(res => {
      this.currentUser = res as User
      this.staffServce.fetchStaff()
      this.staffServce.staffData$.subscribe(users =>{
        this.admins = users.filter(user=>user.is_buildingadmin && !user.is_active)
        this.staff = users
        this.pageSize = 10
        this.totalPages = (Math.ceil((this.admins.length)/this.pageSize))
        this.currentPage = 1
        this.showPag = this.totalPages > 1?true:false
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
    this.staffServce.staffData$.subscribe(res => {
      const admins:User[] = res.filter(i=>i.is_assistant_superadmin)
      const data: User[] = admins.filter(i => {
        let str: string = this.searchString.toLowerCase().trim()
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
      this.admins = data.filter(user=>user.is_buildingadmin && !user.is_active)
    })
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
