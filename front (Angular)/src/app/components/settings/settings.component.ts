import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PublicFunctionsService} from '../../services/public-functions.service';
import {  trigger,  state,  style,  animate,  transition,  } from '@angular/animations';
import {MusicServiceService} from '../../services/music/music-service.service';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-settings',
  imports: [
    FormsModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  animations: [
    trigger('fadeInOut', [

      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SettingsComponent implements OnInit{

  @ViewChild('wrapper') wrapperRef!: ElementRef;

  isMusicEnabled: boolean = true;

  tracks = [
    { key: 'beneath',  label: 'Beneath the Mask',                  src: 'assets/sounds/music/Beneath the Mask.mp3' },
    { key: 'phantoms', label: 'Phantoms',                          src: 'assets/sounds/music/Phantoms.mp3' },
    { key: 'royal',    label: 'Royal Days - Persona 5 The Royal',  src: 'assets/sounds/music/Royal Days - Persona 5 The Royal.mp3' },
    { key: 'mother',   label: 'The Days When My Mother Was There', src: 'assets/sounds/music/The Days When My Mother Was There.mp3' }
  ];

  selectedTrackSrc =this.tracks[2].src

  constructor(private functions: PublicFunctionsService, private musicService: MusicServiceService) {}

  navigateTo(route: string) {
    const wrapper = this.wrapperRef.nativeElement as HTMLElement;
    wrapper.classList.add('fade-out');

    setTimeout(() => {
      this.functions.changeRoute(route);
    }, 1000);
  }

  ngOnInit(): void {
    console.log('SettingsComponent ngOnInit start');

    const storedMusic = localStorage.getItem('playMusic');
    this.isMusicEnabled = storedMusic === null ? true : storedMusic === 'true';
    console.log('Music enabled from localStorage:', this.isMusicEnabled);

    const storedTrackSrc = localStorage.getItem('selectedTrack');
    console.log('Stored track src from localStorage:', storedTrackSrc);

    if (storedTrackSrc && this.tracks.some(t => t.src === storedTrackSrc)) {
      this.selectedTrackSrc = storedTrackSrc;
      console.log('Using stored track src:', this.selectedTrackSrc);
    } else {
      const currentSrc = this.musicService.getCurrentTrackSrc();
      console.log('Current track src from service:', currentSrc);

      const foundTrack = this.tracks.find(t => currentSrc.includes(t.src));
      if (foundTrack) {
        this.selectedTrackSrc = foundTrack.src;
        localStorage.setItem('selectedTrack', foundTrack.src);
        console.log('Found and set track src from service:', this.selectedTrackSrc);
      } else {
        console.log('No matching track found, using default:', this.selectedTrackSrc);
      }
    }

    const currentServiceSrc = this.musicService.getCurrentTrackSrc();
    console.log('Current service src before sync:', currentServiceSrc);

    if (!currentServiceSrc.includes(this.selectedTrackSrc)) {
      console.log('Track src mismatch, setting new track src in service:', this.selectedTrackSrc);
      this.musicService.setTrack(this.selectedTrackSrc);
    } else {
      console.log('Track src matches, no need to set new track.');
    }

    if (this.isMusicEnabled) {
      if (!this.musicService.isPlaying()) {
        console.log('Music enabled and not playing, starting playback');
        this.musicService.playMusic();
      } else {
        console.log('Music already playing');
      }
    } else {
      console.log('Music disabled, pausing playback');
      this.musicService.pauseMusic();
    }

    console.log('SettingsComponent ngOnInit end');
  }






  onToggleMusic(event: Event) {
    const input = event.target as HTMLInputElement;
    this.isMusicEnabled = input.checked;
    localStorage.setItem('playMusic', this.isMusicEnabled.toString());

    if (this.isMusicEnabled) {
      this.musicService.playMusic();
    } else {
      this.musicService.pauseMusic();
    }
  }

  onTrackChange(newSrc: string) {
    this.selectedTrackSrc = newSrc;
    localStorage.setItem('selectedTrack', this.selectedTrackSrc);

    if (!this.musicService.getCurrentTrackSrc().includes(this.selectedTrackSrc)) {
      this.musicService.setTrack(this.selectedTrackSrc);
      if (this.isMusicEnabled) {
        this.musicService.playMusic();
      }
    }
  }


  @ViewChild('trackSelect') trackSelectRef!: ElementRef<HTMLSelectElement>;

  setSelectedTrackSrc(src: string) {
    this.selectedTrackSrc = src;

    if (this.trackSelectRef && this.trackSelectRef.nativeElement) {
      this.trackSelectRef.nativeElement.value = src;
    }
  }


}
