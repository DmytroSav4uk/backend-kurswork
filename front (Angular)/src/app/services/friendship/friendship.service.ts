import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {urls} from '../../configs/urls';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {

  constructor(private http:HttpClient) { }

  getAll():Observable<any>{
    return this.http.get(urls.friends.getAll)
  }

  send(body:any):Observable<any>{
    return this.http.post(urls.friends.send, body)
  }

  accept(body:any):Observable<any>{
    return this.http.post(urls.friends.accept, body)
  }

  reject(body:any):Observable<any>{
    return this.http.post(urls.friends.reject, body)
  }



}
