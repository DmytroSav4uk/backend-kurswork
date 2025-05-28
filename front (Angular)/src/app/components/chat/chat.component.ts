import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MessagesService} from '../../services/messages/messages.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {WebsocketService} from '../../services/websocket/websocket.service';
import {PublicFunctionsService} from '../../services/public-functions.service';
import {NgClass, NgStyle} from '@angular/common';
import {imageBaseUrl} from '../../configs/urls';
import {trigger, transition, style, animate, query, stagger} from '@angular/animations';

@Component({
  selector: 'app-chat',
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgStyle
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('messageWrapper') private messagesContainer!: ElementRef;

  chatId: any;
  messageForm!: FormGroup;
  messages: any[] = [];
  wsSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessagesService,
    private fb: FormBuilder,
    private wsService: WebsocketService,
    private publicFn: PublicFunctionsService
  ) {
  }

  menu: any = {index: null, message: null};

  ngOnInit() {
    const tokenString = localStorage.getItem('JWT');
    let token = '';

    if (tokenString) {
      try {
        const tokenObj = JSON.parse(tokenString);
        token = tokenObj.access_token || '';
      } catch (e) {
        console.error('Invalid token in localStorage', e);
      }
    }

    this.wsService.connect(token);

    this.wsSubscription = this.wsService.onMessage().subscribe(msg => this.handleWsMessage(msg));

    this.route.paramMap.subscribe(params => {
      this.chatId = params.get('id');
      this.getMessages();
    });

    this.messageForm = this.fb.group({
      content: ['', Validators.required]
    });

    this.getCurrentUser();

    if (this.messages) {
      this.scrollToBottom(false)
    }

  }

  ngAfterViewInit(): void {
    this.measureMessageHeights();

    this.contentRefs.changes.subscribe(() => {
      this.measureMessageHeights();
    });
  }

  currentUser: any

  getCurrentUser() {
    this.publicFn.getCurrentUser().subscribe((res) => {
      this.currentUser = res
    })
  }

  ngOnDestroy() {
    this.wsSubscription.unsubscribe();
    this.wsService.disconnect();
  }

  getMessages() {
    this.messageService.getMessages(this.chatId).subscribe(res => {
      this.messages = res.conversation;
    });
  }

  getAccessToken(): string {
    const tokenString = localStorage.getItem('JWT');
    if (!tokenString) {
      return '';
    }
    try {
      const tokenObj = JSON.parse(tokenString);
      return tokenObj.access_token || '';
    } catch (e) {
      console.error('Invalid token format in localStorage', e);
      return '';
    }
  }

  sendMessage() {
    if (this.messageForm.invalid) return;

    const token = this.getAccessToken();

    const payload = {
      token,
      receiver_id: this.chatId,
      content: this.messageForm.value.content
    };

    this.wsService.send({action: 'send', ...payload});

    this.messageForm.reset();

    setTimeout(() => {
      this.scrollToBottom(true)
    }, 100)


  }

  handleWsMessage(data: any) {
    switch (data.type) {
      case 'message_sent':
        if (
          (data.message.sender_id == this.currentUser.id && data.message.receiver_id == this.chatId) ||
          (data.message.sender_id == this.chatId && data.message.receiver_id == this.currentUser.id)
        ) {
          this.messages.push(data.message);
        }
        break;
      case 'typing':
        if (data.sender_id !== this.currentUser?.id) {
          this.typingUsers.add(data.sender_id);


          if (this.typingTimeouts.has(data.sender_id)) {
            clearTimeout(this.typingTimeouts.get(data.sender_id));
          }


          const timeout = setTimeout(() => {
            this.typingUsers.delete(data.sender_id);
            this.typingTimeouts.delete(data.sender_id);
          }, 3000);

          this.typingTimeouts.set(data.sender_id, timeout);
        }
        break;
      case 'message_edited':
        this.messages = this.messages.map(m =>
          m.id === data.message_id ? {...m, content: data.content} : m
        );
        break;

      case 'message_deleted':
        this.messages = this.messages.filter(m => m.id !== data.message_id);
        break;

      case 'conversation_update':
        this.messages = data.conversation;
        break;

      case 'auth_ok':
        console.log('Authenticated with WebSocket as user:', data.user_id);
        break;

      case 'error':
        console.error('WebSocket error:', data.error);
        break;

      default:
        console.log('Unknown message type:', data);
    }
  }


  messageHeights: number[] = [];
  @ViewChildren('contentRef') contentRefs!: QueryList<ElementRef>;

  measureMessageHeights(): void {
    this.messageHeights = this.contentRefs.map((el: ElementRef) => {
      return el.nativeElement.offsetHeight;
    });
  }

  scrollToBottom(smooth: boolean): void {
    const el = this.messagesContainer.nativeElement;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });

  }

  protected readonly imageBaseUrl = imageBaseUrl;


  onContextMenu(e: MouseEvent, message: any, index: number) {
    e.preventDefault();                         // блокуємо дефолтне меню
    if (message.sender_id !== this.currentUser?.id) return;

    this.menu = {index, message};             // показуємо наше меню
  }

  closeContextMenu() {
    this.menu = {index: null, message: null}; // ховаємо
  }



  deleteMessage(msgId: number) {
    const token = this.getAccessToken();

    const payload = {
      action: 'delete',
      token,
      message_id: msgId
    };

    this.wsService.send(payload);
    this.menu.index = null
  }

  editing: boolean = false
  idToEdit: any

  startEditing(id: any, content: any) {
    this.messageForm.patchValue({content});
    this.editing = true
    this.idToEdit = id
    this.menu.index = null
  }

  editMessage() {
    if (this.messageForm.invalid || !this.idToEdit) return;

    const token = this.getAccessToken();
    const content = this.messageForm.value.content;

    const payload = {
      action: 'edit',
      token,
      message_id: this.idToEdit,
      content
    };

    this.wsService.send(payload);

    this.cancelEdit();
  }


  cancelEdit(){
    this.messageForm.reset()
    this.editing = false
    this.idToEdit = null
  }


  notifyTyping() {
    const token = this.getAccessToken();

    const payload = {
      action: 'typing',
      token,
      receiver_id: this.chatId
    };

    this.wsService.send(payload);
  }

  typingUsers: Set<number> = new Set();
  typingTimeouts: Map<number, any> = new Map();


}
