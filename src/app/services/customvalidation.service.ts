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
      if (!control.value) {
        return null;
      }
      const regex = control.value;
      if (regex.match(/[+]/)) {
        return { 'invalidPattern': true };
      }
      return null;
    };
  }

  constructor() { }
}
