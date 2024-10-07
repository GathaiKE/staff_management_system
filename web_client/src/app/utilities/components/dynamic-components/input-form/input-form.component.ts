// import { CommonModule } from '@angular/common';
import { NgFor, NgIf, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Branch, Leave, Message, NewsFormData, Organization, Shift, User } from '../../../../dashboard/interfaces/interfaces';
import { AuthService } from '../../../../auth/auth.service';
import { BranchService } from '../../../../dashboard/services/branch/branch.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-input-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgFor, NgIf, NgClass, DatePipe, AsyncPipe],
  templateUrl: './input-form.component.html',
  styleUrl: './input-form.component.css'
})
export class InputFormComponent implements OnInit, OnDestroy{
  organizationId!:string
  branches!:Branch[]
  leaveTypes!: Leave[]
  leaveType!:Leave
  fetchErr!:string
  formDisabled!:boolean
  showButtons!:boolean
  staff!:User[]
  post!:Message
  filteredStaff!:User[]
  filterText!:FormGroup<any>
  custom!:boolean
  newPost: NewsFormData = {
    image: null,
    body: '',
    title: ''
  }

  @Input() size?:string
  @Input() title?:string
  @Input() action?:{abort?:string, submit?:string}
  @Input() duration?:string
  @Input() activeForm?:string
  @Input() data?:any
  @Output() abortEvent:EventEmitter<any> = new EventEmitter()
  @Output() submitEvent:EventEmitter<any> = new EventEmitter()

  //forms
  registerStaff!:FormGroup<any>
  registerShift!:FormGroup<any>
  makeAdmin!:FormGroup<any>
  recordPayment!:FormGroup<any>
  registerOrganization!:FormGroup<any>
  updateOrganization!:FormGroup<any>
  registerBranch!:FormGroup<any>
  registerBuilding!:FormGroup<any>
  leaveTypeForm!:FormGroup<any>
  memoForm!:FormGroup<any>
  postNewsForm!:FormGroup<any>
  newsImageUpdateText!: 'Add' | 'Change'
  updateUserForm!:FormGroup<any>
  newLeaveApplication!:FormGroup<any>
  updateLeaveTypeForm!:FormGroup<any>
  updateShift!:FormGroup<any>
  assignShift!:FormGroup<any>
  showNameFilterField:boolean = true
  submitBackground!:'delete' | 'update'
  private formDataSub:Subject<any> = new Subject()
  formData$:Observable<any> = this.formDataSub.asObservable()

  selectedBranch!:string

  checked:boolean = false

  constructor(
    private elementRef:ElementRef, 
    private fb:FormBuilder,
  ){}
  updateCustom(){
    this.custom = !this.custom
    console.log(this.custom)
  }

  ngOnInit(): void {
    this.initForm();
    if(this.action?.submit){
      this.submitBackground = 'delete'
    }else{
      this.submitBackground = "update"
    }
    this.custom = false
  }
  
  ngOnDestroy(): void {
    
  }

  initForm(){
    switch (this.activeForm) {
      case 'registerStaff':
        this.branches = this.data?.data
        this.organizationId = this.data?.id
        this.fetchErr = this.data?.error

        this.registerStaff = this.fb.group({
          firstName: ['', [Validators.required]],
          middleName: ['', [Validators.required]],
          lastName: [''],
          email: [''],
          dob: [''],
          phoneNumber: [''],
          address: [''],
          branch: [''],
          building: [''],
          department: [''],
          password: [''],
          staffNumber:[''],
          idNumber:['']
        });  
      break;
      case 'makeAdmin':
        switch (this.title) {
          case "Make Branch Admin":
            this.makeAdmin = this.fb.group({
              filterText:[''],
              branch:['']
            })
          break;
          case "Make Building Admin":
            this.makeAdmin = this.fb.group({
              filterText:[''],
              building:['']
            })
          break;
          case "Make Organization Admin":
            this.makeAdmin = this.fb.group({
              filterText:[''],
              organization:['']
            })
          break;
          case "Make Assistant Admin":
            this.makeAdmin = this.fb.group({
              filterText:['']
            })
          break;
          default:
            this.makeAdmin = this.fb.group({
              filterText:['']
            })
          break;
        }
      break;
      case 'assignShift':
        this.staff = this.data.staff
        this.filteredStaff =  []
        this.assignShift = this.fb.group({
          filterText:['']
        })
      break;
      case 'registerShift':
        this.registerShift = this.fb.group({
          role:[''],
          repeat:[''],
          startDate:[''],
          endDate:[''],
          startTime:[''],
          endTime:[''],
          days:this.fb.group({
            s:[false],
            m:[false],
            t:[false],
            w:[false],
            th:[false],
            f:[false],
            sa:[false],
          }),
          numberOfDays:[''],
          staffCount:['']
        })
      break;
      case "updateShift":
        const shift:Shift = this.data.shift
        this.updateShift = this.fb.group({
          role:[shift.type],
          startDate:[shift.start_date],
          endDate:[shift.end_date],
          startTime:[shift.start_time],
          endTime:[shift.end_time],
          staffCount:[shift.number_of_workers]
        })
      break;
      case 'recordPayment':
        this.recordPayment = this.fb.group({
          orgNumber:[''],
          transactionNumber:[''],
          paymentDate:[''],
          receiptNo:[''],
          amount:[''],
          paymentMethod:['']
        })
      break;
      case "registerOrganization":
       this.registerOrganization = this.fb.group({
        orgName:[''],
        address:[''],
        phoneNumber:[''],
        email:[''],
        status:[true]
       })
      break;
      case "updateOrganization":
       if(this.data.org){
        const organization:Organization = this.data.org
        this.updateOrganization = this.fb.group({
          orgName:[organization.name],
          address:[organization.organization_location],
          phoneNumber:[organization.organization_tel],
          email:[organization.organization_email]
         })
       }
      break;
      case "registerBranch":
        this.registerBranch = this.fb.group({
          branchNumber:[''],
          branchName:[''],
          address:[''],
          status:['']
        })
      break;
      case "registerBuilding":
        this.registerBuilding = this.fb.group({
          buildingNumber:[''],
          buildingName:[''],
          branch:[''],
          status:[false]
        })
      break;
      case "newLeaveType":
        this.leaveTypeForm = this.fb.group({
          name:[''],
          days:[''],
          status:[false]
        })
      break;
      case 'updateLeaveType':
        this.leaveType = this.data.type
        this.updateLeaveTypeForm = this.fb.group({
          name:[this.leaveType.type],
          days:[parseInt(this.leaveType.days)],
          status:[false]
        })

      break;
      case "newMemo":
        this.memoForm = this.fb.group({
          title:[''],
          body:[''],
          status:[false]
        });
      break;
      case "updateMemo":
        this.post = this.data.post
        this.memoForm = this.fb.group({
          title:[this.post.message_title],
          body:[this.post.body],
          status:[false]
        });
      break;
      case "newRelease":
        this.newsImageUpdateText = 'Add'
        this.postNewsForm = this.fb.group({
          title:[''],
          body:[''],
          image:[null]
        })
      break;
      case 'updatePublication':
        this.post = this.data.post
        this.newsImageUpdateText = 'Change'
        this.postNewsForm = this.fb.group({
          title:[this.post.message_title],
          body:[this.post.body],
          image:[null]
        })
      break;
      case "updateUser":
      if(this.data.userToUpdate && this.data.currentUserId){
        const user:User = this.data.userToUpdate
        const activeUserId:string = this.data.currentUserId
        this.formDisabled = this.data.userToUpdate.id !== this.data.currentUserId?true:false
        if(this.action?.submit){
          this.action.submit = this.data.userToUpdate.id !== this.data.currentUserId?"Delete":this.action?.submit
        }
        this.title = this.data.userToUpdate.id === this.data.currentUserId?"Update Profile":this.title
        this.updateUserForm = this.fb.group({
          firstName:[{value:user.first_name, disabled:this.formDisabled}],
          middleName:[{value:user.middle_name, disabled:this.formDisabled}],
          lastName:[{value:user.last_name, disabled:this.formDisabled}],
          email:[{value:user.email, disabled:this.formDisabled}],
          dob:[{value:user.user_dob, disabled:this.formDisabled}],
          phoneNumber:[{value:user.phone_number, disabled:this.formDisabled}],
          address:[{value:user.user_address, disabled:this.formDisabled}]
        })
      }
      break;
      case "newLeaveApplication":
      this.leaveTypes = this.data.types
        this.newLeaveApplication = this.fb.group({
          leaveType:[''],
          startDate:[''],
          endDate:['']
        })
      break;
      default:
        this.registerStaff = this.fb.group({
          none:['']
        });
      break;
    }
  }

  

  selectDay(day: string): void {
    console.log(day)
    const dayControl = this.registerShift.get(`days.${day.toLowerCase()}`);
    dayControl?.setValue(!dayControl.value);
  }

  abort(){
    this.elementRef.nativeElement.remove()
    this.abortEvent.emit()
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newPost.image = input.files[0];
    }
  }

  submit(){
    let formData:any = {}
    switch (this.activeForm) {
      case 'registerStaff':
        formData = this.registerStaff.value
      break;
      case 'registerShift':
        
      const days = [
        this.registerShift.get('days')?.value.s?'sun':null,
        this.registerShift.get('days')?.value.m?'mon':null,
        this.registerShift.get('days')?.value.t?'tue':null,
        this.registerShift.get('days')?.value.w?'wed':null,
        this.registerShift.get('days')?.value.th?'thu':null,
        this.registerShift.get('days')?.value.f?'fri':null,
        this.registerShift.get('days')?.value.sa?'sat':null,
      ].filter(d=>d !== null)
      
      formData = {
        ...this.registerShift.value,
        days:days
      }
      break;
      case 'assignShift':
        formData = this.assignShift.value
      break;
      case 'updateShift':
        formData = this.updateShift.value
      break;
      case 'makeAdmin':
        formData = this.makeAdmin.value
      break;
      case 'recordPayment':
        formData = this.recordPayment.value
      break;
      case 'registerOrganization':
        formData = this.registerOrganization.value
      break;
      case "updateOrganization":
        formData = this.updateOrganization.value
      break;
      case "registerBranch":
        formData = this.registerBranch.value
      break;
      case "registerBuilding":
        formData = this.registerBuilding.value
      break;
      case "newLeaveType":
        formData = this.leaveTypeForm.value
      break;
      case 'updateLeaveType':
      formData = this.updateLeaveTypeForm.value
      break;
      case "newMemo":
        formData = {
          ...this.memoForm.value,
          image:this.newPost.image
        }
      break;
      case "updateMemo":
        formData = {
          ...this.memoForm.value,
          image:this.newPost.image
        }
      break;
      case "newRelease":
        formData = {
          ...this.postNewsForm.value,
          image:this.newPost.image
        }
      break;
      case 'updatePublication':
        formData = {
          ...this.postNewsForm.value,
          image:this.newPost.image
        }
      break;
      case "updateUser":
        if(this.action?.submit?.toLowerCase().trim() === 'update'){
          formData = this.updateUserForm.value
        }else{
          formData = 'confirm'
        }
      break;
      case "newLeaveApplication":
        formData =this.newLeaveApplication.value
      break;
      default:
        formData = {}
      break;
    }
    console.log(formData)
    this.formDataSub.next(formData)
    this.elementRef.nativeElement.remove()
    this.submitEvent.emit(formData)
  }


  onSelection(event:Event): void {
    const selectedValue:string = (event.target as HTMLSelectElement).value
    this.showNameFilterField = !!selectedValue;
  }

  filterStaff(event:Event){
    const text:string = (event.target as HTMLInputElement).value
    console.log(text)
   this.filteredStaff = this.staff.filter(user=>{
          return (user.first_name.trim().toLowerCase().includes(text) ||
              user.last_name.trim().toLowerCase().includes(text) ||
              user.staff_number.trim().toLowerCase().includes(text) ||
              user.email.trim().toLowerCase().includes(text) ||
              user.middle_name.trim().toLowerCase().includes(text) ||
              user.staff_department?.trim().toLowerCase().includes(text) ||
              user.id_number.trim().toLowerCase().includes(text)
            )
    })
  }

  
}
