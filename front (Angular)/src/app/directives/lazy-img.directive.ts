import {Directive, ElementRef, HostBinding, Input, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[appLazyImg]'
})
export class LazyImgDirective implements OnInit {
  @Input('appLazyImg') src!: string;
  @Input() placeholder: string = 'assets/images/shared/placeholder.jpg';
  @Input() fallback: string = 'assets/images/shared/fallback.jpg';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const nativeEl: HTMLImageElement = this.el.nativeElement;


    this.renderer.setAttribute(nativeEl, 'src', this.placeholder);
    this.renderer.setStyle(nativeEl, 'opacity', '0');
    this.renderer.setStyle(nativeEl, 'transition', 'opacity 0.5s ease-in');

    const img = new Image();
    img.src = this.src;

    img.onload = () => {
      this.renderer.setAttribute(nativeEl, 'src', this.src);
      requestAnimationFrame(() => {
        this.renderer.setStyle(nativeEl, 'opacity', '1');
      });
    };

    img.onerror = () => {
      this.renderer.setAttribute(nativeEl, 'src', this.fallback);
      this.renderer.setStyle(nativeEl, 'opacity', '1');
    };
  }
}
