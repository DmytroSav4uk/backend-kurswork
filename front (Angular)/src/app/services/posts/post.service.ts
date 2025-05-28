import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {urls} from '../../configs/urls';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) {
  }

  getAllPosts(): Observable<any> {
    return this.http.get(urls.post.getAll)
  }


  getComments(id: any): Observable<any> {
    return this.http.get(urls.comment.getAll + "?post_id=" + id)
  }


  createPost(data: any): Observable<any> {
    return this.http.post(urls.post.create, data)
  }

  createComment(body: any): Observable<any> {
    return this.http.post(urls.comment.create, body)
  }

  deleteComment(body: any): Observable<any> {
    return this.http.post(urls.comment.delete, body)
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(urls.post.delete + '?id=' + id)
  }


  getPostById(id: number): Observable<any> {
    return this.http.get(urls.post.getById + id)
  }


  updateComment(body: any) {
    return this.http.put(urls.comment.update, body)
  }


}
