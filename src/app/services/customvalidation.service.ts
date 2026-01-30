import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CustomvalidationService {

  dashValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      const regExp = control.value;
      if (regExp.match(/[-]/)) {
        return { 'invalid_Pattern': true };
      }
      return null;
    };
  }

  plusValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      // Allow + symbol now
      return null;
    };
  }

  whitespace(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      const isValid = !control.value || (!control.value.startsWith(' ') && !control.value.endsWith(' '));
      return isValid ? null : { 'whitespace': true };
    };
  }

  constructor() { }
}
