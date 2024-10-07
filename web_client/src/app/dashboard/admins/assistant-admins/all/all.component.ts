import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NewAdmin, NewStaff, User, UserFormData } from '../../../interfaces/interfaces';
import { DynamicComponentsService } from '../../../../utilities/components/dynamic-components/dynamic-components.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip'
import { StaffService } from '../../../services/staff/staff.service';
import { AuthService } from '../../../../auth/auth.service';
import { FormComponent } from '../../../../utilities/components/dynamic-components/form/form.component';
import { Router } from '@angular/router';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-all',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatTooltipModule, FormComponent, PaginatorComponent, MatTooltipModule, SpinnerComponent],
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})
export class AllComponent implements OnInit {
  pageSize:number = 1
  currentPage:number = 1
  totalPages:number = 0
  showPag:boolean = false
  displayedData:User[] = []
  noRecords:string = 'No Records to Show'
  adminForm!: FormGroup
  formConfig: { [key: string]: { label?: string, type: string, options?: string[] } } = {
    filterText: { label: 'Search user by name, ID number, staff number...', type: 'text' },
    id:{type:'hidden'}
  };
  showForm:boolean = false
  submit: string = 'Appoint'
  title: string = 'Make Assistant Admin'
  abort: string = 'Cancel'
  size: string = 'fit'
  currentUser!: User
  admins: User[] = []
  staff:User[] = []
  searchString:string= ''
  unfilteredAdmins:User[] = []
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
          is_assistant_superadmin:true,
          is_branchadmin:user.is_branchadmin,
          is_buildingadmin:user.is_buildingadmin,
          is_organizationadmin:user.is_organizationadmin
        }
        if(user.is_assistant_superadmin){
          this.dynamicComponentSevice.loadFeedback(`${user.first_name} ${user.middle_name} ${user.last_name} is already an assistant admin`, {duration:2500})
        }else{
          this.staffServce.updateUser(value.id, payload).subscribe(res=>{
            if(res.data.id){
              this.dynamicComponentSevice.loadFeedback(`${user.first_name} ${user.middle_name} ${user.last_name} is now an assistant admin`, {duration:2500})
            } else{
              this.dynamicComponentSevice.loadFeedback(`Failed to make ${user.first_name} ${user.middle_name} ${user.last_name} an assistant admin`, {duration:2500})
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
        this.admins = users.filter(user=>user.is_assistant_superadmin)
        this.unfilteredAdmins = users.filter(user=>user.is_assistant_superadmin)
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
