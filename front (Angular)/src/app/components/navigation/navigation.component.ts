import {Component} from '@angular/core';
import {PublicFunctionsService} from '../../services/public-functions.service';

@Component({
  selector: 'app-navigation',
  imports: [],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {


  constructor(private publicFunctions: PublicFunctionsService) {
  }





  navigateTo(route: string, withMoveAwayAnim:boolean, withTimeout:boolean) {

    const navFather = document.querySelector('.navFather');
    const navBackGround = document.querySelector('.navBackGround');

    if (navFather && navBackGround) {

      if (withMoveAwayAnim){
        navBackGround.classList.add('move-right');
        navFather.classList.add('move-right');
      }

      if (withTimeout){
        setTimeout(() => {
          this.publicFunctions.changeRoute(route);
        }, 1000);
      }else {
        this.publicFunctions.changeRoute(route);
      }


    }
  }

}
