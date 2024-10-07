import { Component, OnInit } from '@angular/core';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Branch, NewBranch, NewBranchFormData, User } from '../../interfaces/interfaces';
import { BranchService } from '../../services/branch/branch.service';
import { AuthService } from '../../../auth/auth.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { DualRowFormComponent } from '../../../utilities/components/dynamic-components/dual-row-form/dual-row-form.component';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor, NgIf, DatePipe, PaginatorComponent, DualRowFormComponent, SpinnerComponent],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent implements OnInit{
  organizationId:string = ''
  branches!:Branch[]
  searchString:string = ''
  currentPage:number = 1
  pageSize:number = 1
  totalPages:number =1
  displayedData:Branch[] = []
  showPag:boolean = false
  showForm:boolean = false
  registerBranchForm!:FormGroup<any>
  updateBranchForm!:FormGroup<any>
  selectedBranch!:Branch
  showUpdateForm:boolean = false
  noRecords:string = 'No records found'
  showSpinner:boolean = false


  constructor(
    private dynamicComponentService:DynamicComponentsService,
    private branchService:BranchService,
    private authService:AuthService,
    private fb:FormBuilder
    ){}

    ngOnInit(): void {
        this.fetchData()
        this.initForm()
    }

    fetchData(){
      this.showSpinner = true
      this.authService.activeUser()
      this.authService.currentUser$.subscribe(res=>{
        if(res){
          const user:User = res
          if(user.user_organization.organization){
            this.organizationId = user.user_organization.organization.id
            this.branchService.fetch()
            this.branchService.branches$.subscribe(branches=>{
              this.branches = branches?.filter(b=>b.organization.id === this.organizationId) as Branch[]
              this.pageSize = 5
              this.totalPages = (Math.ceil((this.branches.length)/this.pageSize))
              this.currentPage = 1
              this.showPag = this.totalPages > 1?true:false
              this.showSpinner = false
              this.updateDisplay()
            })
          }
        }
      })
    }

  initForm(){
    this.registerBranchForm = this.fb.group({
      branchNumber:['', Validators.required],
      branchName:['', Validators.required],
      address:['', Validators.required],
      status:[true]
    })
  }

  formConfig:{[key:string]:{label:string, type:string, options?:string[]}}={
    branchNumber:{label:'Branch Number', type:'text'},
    branchName:{label:'Name', type:'text'},
    address:{label:'Location', type:'text'},
    status:{label:'Status', type:'checkbox'}
  }

  close(){
    this.showForm = false
  }

  openForm(){
    this.showForm = true
  }

  regiterBranch(value:NewBranchFormData){
    if (this.organizationId) {
      const payload: NewBranch = {
        branch_number: value.branchNumber,
        location: value.address,
        name: value.branchName,
        organization: this.organizationId,
      };
      this.branchService.registerBranch(payload).subscribe((res) => {
        
        if (res.data.id) {
          this.dynamicComponentService.loadFeedback(
            'Branch Registered Successfully!',
            { duration: 2000 }
          );
        } else {
          this.dynamicComponentService.loadFeedback(
            'Failed to register branch',
            { duration: 2000 }
          );
        }
      });
    } else {
      return
    }
  }



  showUpdateBranch(branch:Branch){
    this.selectedBranch = branch
    this.updateBranchForm = this.fb.group({
      branchNumber:[branch.branch_number, Validators.required],
      branchName:[branch.name, Validators.required],
      address:[branch.location, Validators.required],
      status:[true]
    })
    this.showUpdateForm = true
  }

  updateBranch(value:any){
    const payload = {
      branch_number:value.branchNumber,
      name:value.branchName,
      location:value.address,
    }
    this.branchService.updateBranch(payload, this.selectedBranch.id).subscribe(res=>{
      if (res.data.id) {
        this.dynamicComponentService.loadFeedback(
          'Branch Updated Successfully!',
          { duration: 2000 }
        );
      } else {
        this.dynamicComponentService.loadFeedback(
          'Failed to update branch',
          { duration: 2000 }
        );
      }

    })
    
  }

  closeUpdateForm(){
    this.showUpdateForm = false
  }

  deleteBranch(id:string){
    this.branchService.deleteBranch(id).subscribe(res=>{
      if (res.data !== undefined && res.error === undefined) {
        this.dynamicComponentService.loadFeedback(
          'Branch Deleted Successfully!',
          { duration: 2000 }
        );
      } else {
        this.dynamicComponentService.loadFeedback(
          'Failed to delete branch',
          { duration: 2000 }
        );
      }
      
    })
  }

  filter() {
    this.branchService.branches$.subscribe(branches=>{
      
      this.branches = branches?.filter(b=>b.organization.id === this.organizationId) as Branch[]
      const data: Branch[] = this.branches.filter(i => {
        let str: string = this.searchString.toLowerCase().trim()
        return (i.branch_number.toLowerCase().trim().includes(str) ||
          i.name.toLowerCase().trim().includes(str) ||
          i.location.toLowerCase().trim().includes(str))
      })
      this.branches = data
      this.updateDisplay()
    })
  }
  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.branches.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
