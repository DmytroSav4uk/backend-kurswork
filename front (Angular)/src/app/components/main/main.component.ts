import { Component } from '@angular/core';
import {NavigationComponent} from '../navigation/navigation.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [
    NavigationComponent,
    RouterOutlet
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}
