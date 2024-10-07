import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Leave, Organization, User } from '../../../../dashboard/interfaces/interfaces';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsyncPipe, FormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit, OnDestroy {
  @Input() formTemplate!: FormGroup;
  @Input() formConfig: {[key: string]: { label?: string, type: string, options?: any[]}} = {};
  @Input() size: string = '';
  @Input() title: string = '';
  @Input() submit: string = '';
  @Input() abort: string = '';
  @Input() staff:User[] = []
  @Input() types?:Leave[] = []
  @Input() currentOrganization?:string = ''
  @Input() organizations?:Organization[] = []
  @Input() showSelect?:boolean = false
  @Output() formValue = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<any>();

  filteredDataSub:Subject<User[]> = new Subject()
  filteredData$:Observable<User[]> = this.filteredDataSub.asObservable()
  controls:any[] = []
  selectedOrganization:string = ''
  

  private unsubscribe$ = new Subject<void>();

  initComponent(){
    this.initTypes()
    switch(true){
      case this.formTemplate && this.staff.length !== 0:
        const staff:User[] = this.selectedOrganization?this.staff?.filter(u=>u.user_organization?.organization.id === this.selectedOrganization):this.staff
        this.filteredDataSub.next(staff)
        this.formTemplate.valueChanges.pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(value=>{
          const searchVal:string = value['filterText']?.toLowerCase().trim()
          this.filteredDataSub.next(staff.filter(user => 
            user.first_name?.toLowerCase().trim().includes(searchVal) ||
            user.middle_name?.toLowerCase().trim().includes(searchVal) ||
            user.last_name?.toLowerCase().trim().includes(searchVal) ||
            user.email?.toLowerCase().trim().includes(searchVal) ||
            user.staff_number?.toLowerCase().trim().includes(searchVal) ||
            user.id_number?.toLowerCase().trim().includes(searchVal) ||
            user.phone_number?.toLowerCase().trim().includes(searchVal) ||
            user.staff_department?.toLowerCase().trim().includes(searchVal)));
        })
      break;
      default:
        break;
      }
  }

  ngOnInit(): void {
    if(this.currentOrganization?.length !== 0){
      this.selectedOrganization = this.currentOrganization as string
    }
   this.initComponent()
  }

  initTypes(){
    switch(true){
      case this.types && this.types.length !== 0:
        this.formConfig['leaveType'].options = this.types.map(type=>({
          value:type.id,
          display: type.type
        }))
        this.controls = this.groupControls(this.formTemplate.controls)
        break;
      default:
        this.controls = this.groupControls(this.formTemplate.controls)
        break;
    }
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  submitForm(): void {
    if (this.formTemplate.valid) {
      this.formValue.emit(this.formTemplate.value);
      this.closeForm()
    }
  }

  closeForm(): void {
    this.formTemplate.reset();
    this.closeEvent.emit();
  }

  selectStaff(staff: User): void {
    this.formTemplate.patchValue({ id: staff.id });
    this.filteredDataSub.next([staff]);
  }

  groupControls(controls: { [key: string]: any }): any[] {
    const controlKeys = Object.keys(this.formConfig)
    const result = controlKeys.map(key => ({ key, control: controls[key] }))
    return result;
  }
  
}
