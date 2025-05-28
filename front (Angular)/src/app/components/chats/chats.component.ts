import {Component, OnInit} from '@angular/core';
import {NavigationComponent} from "../navigation/navigation.component";
import {ActivatedRoute, RouterOutlet} from "@angular/router";
import {ChatNavigationComponent} from '../chat-navigation/chat-navigation.component';
import {MessagesService} from '../../services/messages/messages.service';

@Component({
  selector: 'app-chats',
  imports: [
    NavigationComponent,
    RouterOutlet,
    ChatNavigationComponent
  ],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent {




}
