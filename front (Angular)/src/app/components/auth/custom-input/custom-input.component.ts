import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-custom-input',
  imports: [],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.css'
})
export class CustomInputComponent {
  username = '';

  @Output() usernameChange = new EventEmitter<string>();

  onInput(event: Event) {
    const el = event.target as HTMLElement;
    this.username = el.innerText;
    this.usernameChange.emit(this.username);
  }

  get formattedUsername(): string {
    return this.username
      .split('')
      .map((char, i, arr) => {
        const cls = i === arr.length - 1 ? 'last' : '';
        return `<span class="${cls}">${char}</span>`;
      })
      .join('');
  }
}
