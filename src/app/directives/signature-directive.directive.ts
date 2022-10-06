import { Directive, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[signature]',
})
export class SignatureDirectiveDirective implements OnInit, OnChanges
{
	@Output() imgSrc = new EventEmitter<string>();
	@Input('clear') clearMe;
	@Input('options') options;

	private context;
	private density: number;
	private isDrawing = false;
	private sigPadElement;
	public signatureImage: any;

	ngOnInit()
	{
		this.sigPadElement = this.signaturePad.nativeElement;
		this.context = this.sigPadElement.getContext('2d');
		this.context.strokeStyle = this.options.color || '#3742fa';
		this.context.lineWidth = this.options.width || 2;

		if (this.options.blur)
		{
			this.context.shadowBlur = this.options.blur || 2;
			this.context.shadowColor = this.options.blurColor || this.context.strokeStyle;
		}

		this.context.lineCap = 'round';
		this.context.lineJoin = 'round';
		this.density = window.devicePixelRatio || 1;
	}

	ngOnChanges(changes: SimpleChanges)
	{
		if (!this.context)
		{
			return;
		}

		if (changes.clearMe)
		{
			this.clear();
			this.submitForm();
		}
	}

	constructor(private signaturePad: ElementRef)
	{
	}

	@HostListener('touchstart', ['$event'])
	handleTouchStart(e)
	{
		console.log("//////////////////////", e)
		// e.preventDefault();
		this.isDrawing = true;
		this.draw(e, 'layer');
	}

	@HostListener('touchmove', ['$event'])
	handleTouchMove(e)
	{
		console.log("//////////////////////111111111111111111111", e)
		if (!this.isDrawing)
		{
			return;
		}

		// e.preventDefault();
		this.draw(e, 'layer');
	}

	@HostListener('document:touchend', ['$event'])
	@HostListener('document:mouseup', ['$event'])
	onMouseUp()
	{
		if (this.isDrawing)
		{
			this.submitForm();
		}

		this.isDrawing = false;
	}

	@HostListener('mousedown', ['$event'])
	onMouseDown(e)
	{
		this.isDrawing = true;
		this.start(e);
	}

	@HostListener('mousemove', ['$event'])
	onMouseMove(e)
	{
		if (!this.isDrawing)
		{
			return;
		}

		this.draw(e);
	}

	private start(e, type: 'client' | 'layer' = 'client')
	{
		const coords = this.relativeCoords(e, type);
		this.context.moveTo(coords.x, coords.y);
	}

	private draw(e, type: 'client' | 'layer' = 'client')
	{
		const coords = this.relativeCoords(e, type);
		this.context.lineTo(coords.x, coords.y);
		this.context.stroke();
	}

	private relativeCoords(event, type: 'client' | 'layer')
	{
		const bounds = this.sigPadElement.getBoundingClientRect();
		let x = event[type + 'X'];
		let y = event[type + 'Y'];

		if ('layer' !== type)
		{
			x -= bounds.left;
			y -= bounds.top;
		}

		return { x, y };
	}

	clear()
	{
		this.context.clearRect(0, 0, this.sigPadElement.width, this.sigPadElement.height);
		this.context.beginPath();
	}

	submitForm()
	{
		const base64Data = this.imgSrc.emit(this.sigPadElement.toDataURL('image/png'));
		this.signatureImage = base64Data;
	}
}