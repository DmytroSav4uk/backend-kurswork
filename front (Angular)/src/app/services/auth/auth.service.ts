import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {urls} from '../../configs/urls';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  login(data:any):Observable<any>{
    return this.http.post(urls.auth.login, data)
  }

  register(data:any):Observable<any>{
    return this.http.post(urls.auth.register,data)
  }

  getUser():Observable<any>{
    return this.http.get(urls.auth.getUser)
  }
}
