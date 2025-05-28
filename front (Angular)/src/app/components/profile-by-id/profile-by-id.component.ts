import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ImageCropperComponent} from "ngx-image-cropper";
import {imageBaseUrl} from '../../configs/urls';


import {UserService} from '../../services/user/user.service';
import {AuthService} from '../../services/auth/auth.service';
import {FriendshipService} from '../../services/friendship/friendship.service';


@Component({
  selector: 'app-profile-by-id',
    imports: [

    ],
  templateUrl: './profile-by-id.component.html',
  styleUrl: './profile-by-id.component.css'
})
export class ProfileByIdComponent implements OnInit{
  user: any;
  currentUser:any
  imgUrl: string = imageBaseUrl;

  @Input() id!: number;
  @Input() showProfile!: boolean;

  constructor(
    private userService: UserService,
    private authService:AuthService,
    private friendshipService:FriendshipService
  ) {}

  ngOnInit() {
    this.getUser();
    this.getFriends();
  }

  friends:any

  getFriends(){
    this.friendshipService.getAll().subscribe((res)=>{
      this.friends = res.friends
    })
  }

  getUser() {
    this.userService.getById(this.id).subscribe((res) => {
      this.user = res;
    });


    this.authService.getUser().subscribe((res) => {
      this.currentUser = res;
    });
  }

  splitFullName(fullName: string): { firstName: string, lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  }

  @Output() close = new EventEmitter<void>();

  closeProfile() {
      this.close.emit();
  }

  sendFriendRequest(id:number) {

    let body = {
      friend_id: id
    }

    this.friendshipService.send(body).subscribe(()=>{
      this.getFriends()
    })
  }


  isAlreadyFriend(userId: number): boolean {
    return this.friends?.some((friend: any) => friend.id === userId);
  }


}
