import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appLongPress]'
})
export class LongPressDirective {

  @Output() longPress: EventEmitter<any> = new EventEmitter();
  private timeout: any;
  private readonly duration: number = 300; // Adjust the duration as needed

  @HostBinding('class.press-active') isPressActive: boolean = false;

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onMouseDown(event: MouseEvent | TouchEvent) {
    this.timeout = setTimeout(() => {
      this.isPressActive = true;
      this.longPress.emit(event);
    }, this.duration);
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  @HostListener('touchend')
  onRelease() {
    clearTimeout(this.timeout);
    this.isPressActive = false;
  }

}
