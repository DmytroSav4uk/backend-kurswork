import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MusicServiceService} from './services/music/music-service.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit{
  title = 'FullstackCourseWorkFront';

  constructor(private musicService: MusicServiceService, private renderer:Renderer2) {
  }

  @ViewChild('musicAudio') musicAudio!: ElementRef<HTMLAudioElement>;
  @ViewChild('hoverAudio') hoverAudio!: ElementRef<HTMLAudioElement>;
  @ViewChild('clickAudio') clickAudio!: ElementRef<HTMLAudioElement>;

  private isHoverSoundPlaying = false;
  private isClickSoundPlaying = false;

  ngAfterViewInit(): void {
    // Ініціалізуємо аудіо у сервісі
    this.musicService.initAudios({
      music: this.musicAudio.nativeElement,
      hover: this.hoverAudio.nativeElement,
      click: this.clickAudio.nativeElement
    });

    // Завантажуємо останній трек зі сховища (або дефолт)
    const storedTrack = localStorage.getItem('selectedTrack');
    if (storedTrack) {
      this.musicService.setTrack(storedTrack);
    } else {
      this.musicService.setTrack('assets/music/Beneath the Mask.mp3');
    }

    // Якщо звук увімкнено, запускаємо музику
    if (localStorage.getItem('playMusic') === 'true') {
      this.musicService.playMusic();
    }

    // Слухачі для hover та click звуків
    this.renderer.listen(document.body, 'mouseover', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && target.classList.contains('hover-item') && !this.isHoverSoundPlaying) {
        this.isHoverSoundPlaying = true;
        this.musicService.playHoverSound();

        setTimeout(() => {
          this.isHoverSoundPlaying = false;
        }, 300);
      }
    });

    this.renderer.listen(document.body, 'click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.classList.contains('hover-item') ||
          target.classList.contains('clickSound') ||
          target.tagName.toLowerCase() === 'polygon') &&
        !this.isClickSoundPlaying
      ) {
        this.isClickSoundPlaying = true;
        this.musicService.playClickSound();

        setTimeout(() => {
          this.isClickSoundPlaying = false;
        }, 300);
      }
    });
  }


}
