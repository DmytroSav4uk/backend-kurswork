import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {urls} from '../../configs/urls';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }

  updateUser(data:any):Observable<any>{
    return this.http.put(urls.user.update, data)
  }

  uploadProfileImage(image:any):Observable<any>{
    return this.http.post(urls.user.uploadProfileImage, image)
  }


  getById(id:number):Observable<any>{
    return this.http.get(urls.user.getById + id)
  }


}
