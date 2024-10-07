import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router} from '@angular/router';

@Component({
  selector: 'app-verify-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './verify-details.component.html',
  styleUrl: './verify-details.component.css'
})
export class VerifyDetailsComponent {
detailsForm!:FormGroup

constructor(private router:Router){}
navigate(route:string){
  this.router.navigate([route])
}
}
