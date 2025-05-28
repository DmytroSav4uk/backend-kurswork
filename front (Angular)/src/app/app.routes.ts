import {Routes} from '@angular/router';
import {AuthComponent} from './components/auth/auth.component';
import {MainComponent} from './components/main/main.component';
import {SettingsComponent} from './components/settings/settings.component';
import {ProfileComponent} from './components/profile/profile.component';
import {PostsComponent} from './components/posts/posts.component';
import {FriendRequestsComponent} from './components/friend-requests/friend-requests.component';
import {ChatComponent} from './components/chat/chat.component';
import {ChatsComponent} from './components/chats/chats.component';

export const routes: Routes = [

  {path: '', redirectTo: 'auth', pathMatch: 'full'},
  {path: 'auth', component: AuthComponent},
  {
    path: 'main',
    component: MainComponent,
    children: [
      {path: 'profile', component: ProfileComponent},
      {path: 'friends', component: FriendRequestsComponent}
    ]
  },

  {path:'chat',component:ChatsComponent,
  children:[
    {path:':id',component: ChatComponent}
  ]

  }
  ,
  {path: 'settings', component: SettingsComponent},
  {path: 'posts', component: PostsComponent}
];
