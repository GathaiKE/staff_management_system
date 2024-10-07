import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { Router, RouterOutlet } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserFormData } from '../../interfaces/interfaces';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';

@Component({
  selector: 'app-assistant-admins',
  standalone: true,
  imports: [CommonModule, SidenavComponent, HeaderComponent, RouterOutlet, ReactiveFormsModule, FormsModule],
  templateUrl: './assistant-admins.component.html',
  styleUrl: './assistant-admins.component.css'
})
export class AssistantAdminsComponent {
  assistantAdminForm!:FormGroup

  constructor(private router:Router){
    this.router.navigate(['admins/assistant/all'])
  }


  navigate(route:string){
    this.router.navigate([route])
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
}
