import { Component } from '@angular/core';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../utilities/components/header/header.component';

@Component({
  selector: 'app-chatroom',
  standalone: true,
  imports: [SidenavComponent, HeaderComponent],
  templateUrl: './chatroom.component.html',
  styleUrl: './chatroom.component.css'
})
export class ChatroomComponent {

}
