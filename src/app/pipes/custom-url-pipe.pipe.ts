import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customUrlPipe'
})
export class CustomUrlPipePipe implements PipeTransform {

  transform(value: string, ...args: string[]): string {
    console.log(value);
    return null;
  }

}
