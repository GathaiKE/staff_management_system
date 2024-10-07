import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Branch, Organization, User } from '../../../../dashboard/interfaces/interfaces';
import { Observable, Subject } from 'rxjs';
import { FormGroup,  FormsModule,  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dual-row-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dual-row-form.component.html',
  styleUrl: './dual-row-form.component.css'
})
export class DualRowFormComponent implements OnDestroy, OnInit{
  @Input() formTemplate!: FormGroup;
  @Input() size: string = '';
  @Input() title: string = '';
  @Input() submit: string = '';
  @Input() abort: string = '';
  @Input() branches?: Branch[];
  @Input() currentOrganization?:string = ''
  @Output() selectDay = new EventEmitter<any>();
  @Input() data?:any = null
  @Input() formConfig: { [key: string]: { label?: string, type: string, options?: any[] } } = {};
  @Output() formValue = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<any>();
  @Input() showSelect?:boolean = false

  filteredDataSub: Subject<User[]> = new Subject();
  filteredData$: Observable<User[]> = this.filteredDataSub.asObservable();
  controls:any[][] = []
  organizations:Organization[] = []
  userOrganization:string = ''

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    if(this.currentOrganization?.length !== 0){
      this.userOrganization = this.currentOrganization as string
    }
    this.initializeBranches();
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // reInitializeBranches():void{
  //   switch (true) {
  //     case this.branches && this.branches.length > 0:
  //       this.formConfig['branch'].options = this.branches
  //       .filter(b=>b.organization.id === this.userOrganization)
  //       .map(branch => ({
  //           value: branch.id,
  //           display: branch.name
  //         }));

  //         if(this.data && this.data[0]?.org_identifier){
  //           this.showSelect = true
  //           this.organizations = this.data
  //         }
    
  //         this.controls = this.groupControls(this.formTemplate.controls)
  //     break;
  //     default:
  //       this.controls = this.groupControls(this.formTemplate.controls)
  //     break;
  //   }
  // }

  initializeBranches(): void {
    switch (true) {
      case this.branches && this.branches.length > 0:
        this.formConfig['branch'].options = this.branches
        .filter(b=>b.organization.id === this.userOrganization)
        .map(branch => ({
            value: branch.id,
            display: branch.name
          }));

          if(this.data && this.data[0]?.org_identifier){
            this.organizations = this.data
          }
    
          this.controls = this.groupControls(this.formTemplate.controls)
      break;
      default:
        this.controls = this.groupControls(this.formTemplate.controls)
      break;
    }
  }

  submitForm(): void {
    if(this.data && this.data[0]?.org_identifier){
      const value= {
        ...this.formTemplate?.value,
        organization:this.userOrganization
      }
      this.formValue.emit(value);
      this.closeForm();
    } else{
      this.formValue.emit(this.formTemplate?.value);
      this.closeForm();
    }
  }

  groupControls(controls: { [key: string]: any }): any[][] {
    const grouped = [];
    const controlKeys = Object.keys(this.formConfig);

    for (let i = 0; i < controlKeys.length; i += 2) {
      const controlGroup = controlKeys.slice(i, i + 2).map(key => ({ key, control: controls[key] }));
      grouped.push(controlGroup);
    }
    return grouped;
  }

  closeForm(): void {
    this.formTemplate?.reset();
    this.closeEvent.emit();
  }

  selectDayFn(val:string){
    this.selectDay.emit(val)
  }
}
