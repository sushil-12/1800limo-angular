import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'bookingStatusTextReplace'})
export class BookingStatusTextReplacePipe implements PipeTransform {
  transform(value: string, strToReplace: string, replacementStr: string): string {

    if(!value || ! strToReplace || ! replacementStr)
    {
      return value;
    }

 return value.replace(new RegExp(strToReplace, 'g'), replacementStr);
  }
}