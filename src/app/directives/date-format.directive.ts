import
{
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';

@Directive({
	selector: '[setOutputDateFormat]',
})
export class DateFormatDirective
{
	@Input('setOutputDateFormat')
	inputFormat = null;

	@Output()
	dateChangeWithFormat = new EventEmitter<string>();

	constructor() { }

	@HostListener('dateChange', ['$event'])
	onDateChange(event: any)
	{
		const dateFormatted = event.value.format(this.inputFormat);
		this.dateChangeWithFormat.emit(dateFormatted);
	}
}
