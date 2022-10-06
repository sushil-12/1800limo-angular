import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'escapeAllString'
})
export class EscapeAllStringPipe implements PipeTransform
{

	transform(value: string): string
	{
		return value.replace(/\"/g, '"')
	}

}
