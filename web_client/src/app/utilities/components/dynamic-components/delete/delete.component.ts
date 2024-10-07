import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css'
})
export class DeleteComponent {

  @Input() size?:string
  @Input() message?:string
  @Input() action?:{abort?:string, submit?:string}
  @Input() activeForm?:string
  @Output() abortEvent:EventEmitter<any> = new EventEmitter()
  @Output() submitEvent:EventEmitter<any> = new EventEmitter()

  constructor(
    private elementRef:ElementRef
  ){}

  abort(){
    this.elementRef.nativeElement.remove()
    this.abortEvent.emit()
  }

  submit(){
    this.submitEvent.emit('confirm')
    this.elementRef.nativeElement.remove()
  }
}
