import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './auth/auth.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicFunctionsService {

  constructor(private router: Router, private authService:AuthService) {}

  public changeRoute(route: string): void {
    this.router.navigateByUrl(route);
  }

  public getCurrentUser():Observable<any>{
    return  this.authService.getUser()
  }


}
