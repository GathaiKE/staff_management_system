import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StaffService } from '../../dashboard/services/staff/staff.service';
import { DynamicComponentsService } from '../../utilities/components/dynamic-components/dynamic-components.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit{
resetForm!:FormGroup


ngOnInit(): void {
  this.initForm()
}

constructor(
  private fb:FormBuilder,
  private staffService:StaffService,
  private dynamicService:DynamicComponentsService,
  private router:Router
  ){}

initForm(){
  this.resetForm = this.fb.group({
    oldPassword:['', [Validators.required]],
    newPassword:['', [Validators.required]]
  })
}


resetPassword(){
  const payload = {
    old_password:this.resetForm.get('oldPassword')?.value,
    new_password:this.resetForm.get('newPassword')?.value
  }
  if(this.resetForm.valid)[
    this.staffService.changePassword(payload).subscribe(res=>{
      console.log(res)
      if(res?.data?.message){
        this.dynamicService.loadFeedback(`${res.data.message}`,  {duration:1500})
        this.router.navigate(['profile/news/memos'])
      } else if(res?.error?.error){
        this.dynamicService.loadFeedback(`Failed: Wrong Old Password, try again.`, {duration:2000})
      } else{
        this.dynamicService.loadFeedback(`Failed: Unknown Error occured, try again later.`, {duration:2000})
      }
    })
  ]
}

}
