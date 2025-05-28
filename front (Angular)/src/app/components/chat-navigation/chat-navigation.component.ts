import {Component, OnInit} from '@angular/core';
import {FriendshipService} from '../../services/friendship/friendship.service';
import {TruncatePipe} from '../../pipes/truncate.pipe';
import {PublicFunctionsService} from '../../services/public-functions.service';

@Component({
  selector: 'app-chat-navigation',
  imports: [
    TruncatePipe
  ],
  templateUrl: './chat-navigation.component.html',
  styleUrl: './chat-navigation.component.css'
})
export class ChatNavigationComponent implements OnInit {

  constructor(private friendsService: FriendshipService,private publicFn:PublicFunctionsService) {
  }

  ngOnInit() {
    this.getFriends()
  }

  friends:any

  getFriends() {
    this.friendsService.getAll().subscribe(res => {
      this.friends = res.friends
    })
  }


  navigateToChat(id:any){
    this.publicFn.changeRoute('chat/'+id)
  }


  goBack() {
    this.publicFn.changeRoute('main')
  }
}
