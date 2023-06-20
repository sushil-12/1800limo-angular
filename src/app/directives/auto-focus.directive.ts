import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective {

  constructor(private elementRef: ElementRef) {}

  @HostListener('shown.bs.modal')
  focusInput() {
    const inputElement = this.elementRef.nativeElement.querySelector('textarea');
    console.log('------------auto focus directive-------->>>>>>',inputElement)
    if (inputElement) {
      inputElement.focus();
    }
  }

}
