import { Component, TemplateRef } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserFormData } from '../interfaces/interfaces';
import { DynamicComponentsService } from '../../utilities/components/dynamic-components/dynamic-components.service';
import { HeaderComponent } from '../../utilities/components/header/header.component';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, HeaderComponent, SidenavComponent],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent {
  recordPayment!:FormGroup
  constructor(private dynamicComponentService:DynamicComponentsService){}
  record(){
    this.dynamicComponentService.loadForm({activeForm:"recordPayment",size:'fit', title:'Record Payment', duration:'2500',action:{abort:'Cancel', submit:'Record'}}).subscribe(res=>console.log(res))
  }

}
