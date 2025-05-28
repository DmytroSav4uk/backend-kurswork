import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {urls} from '../../configs/urls';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private http: HttpClient) {
  }

  getMessages(id: any): Observable<any> {
    return this.http.get(urls.messages.getAll + id)
  }

  sendMessage(data: any): Observable<any> {
    return this.http.post(urls.messages.send, data)
  }

  changeMessage(id:number, data:any):Observable<any>{
    return this.http.delete(urls.messages.changeDelete + id, data)
  }

  deleteMessage(id:number):Observable<any>{
    return this.http.delete(urls.messages.changeDelete + id)
  }
}
