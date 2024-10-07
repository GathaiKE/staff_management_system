import { Component, TemplateRef } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';

@Component({
  selector: 'app-buildings',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './buildings.component.html',
  styleUrl: './buildings.component.css'
})
export class BuildingsComponent {
  newBuildingForm!:FormGroup

  constructor(private dynamicComponentService:DynamicComponentsService){}

  addBuilding(){
    this.dynamicComponentService.loadForm({activeForm:"registerBuilding",size:'fit', title:'New Building', duration:'2500',action:{abort:'Cancel', submit:'Add'}}).subscribe(res=>console.log(res))
  }
}
