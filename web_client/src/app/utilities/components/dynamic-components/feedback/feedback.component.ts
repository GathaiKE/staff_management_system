import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent {
  @Input() duration?:number
  @Input() message!:string
  @Input() abort?:string
  @Input() submit?:string
  @Output() abortEvent:EventEmitter<any> = new EventEmitter()

  constructor(private elementRef:ElementRef){}

  close(){
    this.elementRef.nativeElement.remove()
    this.abortEvent.emit()
  }
}
