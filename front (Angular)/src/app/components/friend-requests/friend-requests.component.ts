import {Component, OnInit} from '@angular/core';
import {FriendshipService} from '../../services/friendship/friendship.service';
import {imageBaseUrl} from '../../configs/urls';
import {PublicFunctionsService} from '../../services/public-functions.service';

@Component({
  selector: 'app-friend-requests',
  imports: [],
  templateUrl: './friend-requests.component.html',
  styleUrl: './friend-requests.component.css'
})
export class FriendRequestsComponent implements OnInit {

  constructor(private friendService: FriendshipService,private publicFn:PublicFunctionsService) {
  }

  ngOnInit() {
    this.getFriends()
  }


  friends: any[] = [];
  pendingFriends: any[] = [];
  acceptedFriends: any[] = [];

  getFriends() {
    this.friendService.getAll().subscribe((res) => {
      this.friends = res.friends
      this.pendingFriends = this.friends.filter((friend:any) => friend.status === 'pending');
      this.acceptedFriends = this.friends.filter((friend:any) => friend.status === 'accepted');
    })
  }


  protected readonly JSON = JSON;
  protected readonly imgUrl = imageBaseUrl;

  acceptFriend(id:number) {

    let body = {
      friend_id: id
    }

    this.friendService.accept(body).subscribe(()=>{
      this.getFriends()
    })
  }

  goToChat(id:any) {
    this.publicFn.changeRoute('chat/'+id)
  }
}
