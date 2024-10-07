import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Message, Publication } from '../../interfaces/interfaces';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [NgIf],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css'
})
export class NewsDetailComponent {
  @Input() size: string = '';
  @Input() title: string = '';
  @Input() submit: string = '';
  @Input() abort: string = '';
  @Input() editAuthority:boolean = false
  @Input() post:Publication | null= null
  @Output() submitEvent = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<any>();

  closePopup(){
    this.closeEvent.emit()
  }

  submitPopup(){
    this.submitEvent.emit('confirm')
    this.closePopup()
  }
}
