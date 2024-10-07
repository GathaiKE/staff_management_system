import { Component, OnInit } from '@angular/core';
import {
  Branch,
  NewBranch,
  NewBranchFormData,
  Organization,
} from '../../../interfaces/interfaces';
import { ActivatedRoute } from '@angular/router';
import { BranchService } from '../../../services/branch/branch.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { OrganizationService } from '../../../services/organization/organization.service';
import { DynamicComponentsService } from '../../../../utilities/components/dynamic-components/dynamic-components.service';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { DualRowFormComponent } from '../../../../utilities/components/dynamic-components/dual-row-form/dual-row-form.component';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule, PaginatorComponent, DualRowFormComponent],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css',
})
export class BranchesComponent implements OnInit {
  branches!: Branch[];
  branchesErr?: string;
  organizationId!: string;
  searchString: string = '';
  currentPage:number = 1
  pageSize:number = 1
  totalPages:number =1
  displayedData:Branch[] = []
  showPag:boolean = false
  showForm:boolean = false
  registerBranchForm!:FormGroup<any>

  constructor(
    private route: ActivatedRoute,
    private branchService: BranchService,
    private fb:FormBuilder,
    private dynamicComponentService:DynamicComponentsService
  ) {}

  ngOnInit(): void {
    this.extractData();
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

  extractData() {
    this.branchService.fetch();
    this.route.params.subscribe((params) => {
      if (params['id']) {
        const orgId: string = params['id'] as string;
        this.organizationId = orgId;
        this.branchService.branches$.subscribe((res) => {
          this.branches = res?.filter(b=>b.organization?.id === orgId) as Branch[]
          this.pageSize = 5
          this.totalPages = (Math.ceil((this.branches?.length)/this.pageSize))
          this.currentPage = 1
          this.showPag = this.totalPages > 1?true:false
          this.updateDisplay()
        });
        this.branchService.branchesErr$.subscribe((res) => {
          this.branchesErr = res?.error;
        });
        this.initForm()
      }
    });
  }

  filter() {
    this.branchService.fetch();
    this.branchService.branches$.subscribe((res) => {
      const admins: Branch[] = res?.filter(
        (i) => i.organization.id
      ) as Branch[];
      const data: Branch[] = admins.filter((i) => {
        let str: string = this.searchString.toLowerCase().trim();
        return (
          i.branch_number.toLowerCase().trim().includes(str) ||
          i.location.toLowerCase().trim().includes(str) ||
          i.name.toLowerCase().trim().includes(str)
        );
      });
      this.branches = data;
    });
  }

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.branches?.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
