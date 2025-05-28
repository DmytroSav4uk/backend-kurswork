import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicServiceService {

  private musicAudio!: HTMLAudioElement;
  private hoverAudio!: HTMLAudioElement;
  private clickAudio!: HTMLAudioElement;

  initAudios(audios: {
    music: HTMLAudioElement,
    hover: HTMLAudioElement,
    click: HTMLAudioElement
  }) {
    this.musicAudio  = audios.music;
    this.hoverAudio = audios.hover;
    this.clickAudio = audios.click;

    this.musicAudio .volume = 0.5;
    this.hoverAudio.volume = 0.5;
    this.clickAudio.volume = 0.5;

    const playMusic = localStorage.getItem('playMusic');
    if (playMusic === null) {
      localStorage.setItem('playMusic', 'true');
    }

    if (localStorage.getItem('playMusic') === 'true') {
      this.playMusic();
    }
  }

  setTrack(src: string) {
    if (!this.musicAudio) return;

    if (this.musicAudio.src !== src) {
      this.musicAudio.pause();
      this.musicAudio.src = src;
      this.musicAudio.load();
      this.musicAudio.currentTime = 0;
    }
  }

  playMusic() {
    this.musicAudio.currentTime = 0;
    this.musicAudio.play().catch(e => console.warn('autoplay blocked', e));
  }

  pauseMusic() {
    this.musicAudio.pause();
  }

  playHoverSound() {
    if (localStorage.getItem('playMusic') !== 'true') return;

    this.hoverAudio.currentTime = 0;
    this.hoverAudio.play().catch(() => {});
  }

  playClickSound() {
    if (localStorage.getItem('playMusic') !== 'true') return;

    this.clickAudio.currentTime = 0;
    this.clickAudio.play().catch(() => {});
  }

  isPlaying(): boolean {
    return !this.musicAudio.paused && this.musicAudio.volume > 0;
  }

  getCurrentTrackSrc(): string {
    return this.musicAudio?.src || '';
  }

}
