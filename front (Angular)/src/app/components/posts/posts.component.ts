import {Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren} from '@angular/core';
import {PostService} from '../../services/posts/post.service';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserService} from '../../services/user/user.service';
import {imageBaseUrl} from '../../configs/urls';
import {PublicFunctionsService} from '../../services/public-functions.service';
import {NgClass, NgStyle} from '@angular/common';
import {LazyImgDirective} from '../../directives/lazy-img.directive';
import {ProfileComponent} from '../profile/profile.component';
import {ProfileByIdComponent} from '../profile-by-id/profile-by-id.component';


@Component({
  selector: 'app-posts',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgStyle,
    LazyImgDirective,
    NgClass,
    ProfileComponent,
    ProfileByIdComponent
  ],
  templateUrl: './posts.component.html',
  standalone: true,
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit {
  @ViewChildren('commentBlock') commentBlocks!: QueryList<ElementRef>;

  postForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private postService: PostService, private userService: UserService, private publicFunctions: PublicFunctionsService) {
    this.postForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit() {

    this.getCurrentUser()
    this.getPosts()
  }

  posts: any

  getPosts() {
    this.postService.getAllPosts().subscribe((posts) => {
      this.posts = posts;
      posts.forEach((post: any) => this.getUserById(post.user_id));
    });
  }


  currentUser: any

  getCurrentUser() {
    this.publicFunctions.getCurrentUser().subscribe((res) => {
      this.currentUser = res
    })
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  createPost() {
    if (this.postForm.invalid) return;

    const formData = new FormData();
    formData.append('content', this.postForm.value.content);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.postService.createPost(formData).subscribe(() => {
      this.getPosts();
      this.postForm.reset(); // очищає форму
      this.selectedFile = null; // очищає файл
    });
  }


  usersMap: { [key: number]: any } = {};

  getUserById(id: number): void {
    if (!this.usersMap[id]) {
      this.userService.getById(id).subscribe((res) => {
        this.usersMap[id] = res;
      });
    }
  }


  protected readonly imageBaseUrl = imageBaseUrl;

  selectedPostId: any | null = null;

  showDeleteButton(postId: any) {
    this.selectedPostId = this.selectedPostId === postId ? null : postId;
  }


  deletePost(id: number) {
    this.postService.deletePost(id).subscribe(() => {
      this.getPosts()
      this.showDeleteButton(null)
    })
  }


  whereShowComments: any
  comments: any

  getComments(id: any) {

    this.postService.getComments(id).subscribe((res) => {
      this.comments = res
      this.whereShowComments = id
    })


  }


  commentText: string = '';

  submitComment(id: number) {

    let body = {
      post_id: id,
      content: this.commentText
    }
    this.postService.createComment(body).subscribe(() => {
      this.getComments(id)
      this.commentText = ''
    })

  }

  onRightClick(event: MouseEvent, comment: any) {
    event.preventDefault();

    console.log('fdsf')

    this.comments.forEach((c: any) => c.showControls = false);


    if (comment.user_id === this.currentUser.id) {
      comment.showControls = true;
    }
  }


  @HostListener('document:click', ['$event'])
  onGlobalClick(event: MouseEvent) {
    const clickedInsideAny = this.commentBlocks.some(ref => ref.nativeElement.contains(event.target));
    if (!clickedInsideAny) {

      if (this.comments) {
        this.comments.forEach((c: any) => c.showControls = false);
      }

    }
  }

  deleteComment(postId: number, commentId: number) {

    let body = {
      post_id: postId,
      comment_id: commentId
    }

    console.log(body)

    this.postService.deleteComment(body).subscribe(() => {
      this.getComments(postId)
    })
  }


  commentToEditId: any
  editingComment: boolean = false

  startEditing(comment: any) {

    this.commentToEditId = comment.id
    this.commentText = comment.content
    this.comments.forEach((c: any) => c.showControls = false);
    this.editingComment = true


  }


  submitCommentEdit(postId: any) {


    let body = {
      comment_id: this.commentToEditId,
      content: this.commentText
    }


    this.postService.updateComment(body).subscribe(() => {
      this.getComments(postId)
      this.editingComment = false
      this.commentText = ''
      this.commentToEditId = null
    })

  }

  cancelCommentEdit() {
    this.editingComment = false
    this.commentText = ''
    this.commentToEditId = null
  }


  isImage(filename: string): boolean {

    if (!filename) {
      return false
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }


  return() {
    this.publicFunctions.changeRoute('main')
  }

  showProfile: boolean = false
  idOfProfile:any

  showUserProfile(id: number) {
    this.showProfile = true
    this.idOfProfile = id
  }


  closeProfile() {
    this.showProfile = false;
  }
}
