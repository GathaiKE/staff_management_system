import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
loginForm!:FormGroup<any>
error!:any
passwordError!:string

constructor
(private router:Router, 
  private fb:FormBuilder,
  private authService:AuthService
){this.initForm()}
navigate(route:string){
  this.router.navigate([route])
}

initForm(){
  this.loginForm = this.fb.group({
    email:['', [Validators.required, Validators.minLength(5)]],
    password:['', [Validators.required]]
  })
}

logIn(){
  this.authService.login(this.loginForm.value)
}

}
