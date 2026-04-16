import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatChip, ChatMessage } from '../../../../services/chatbot.service';
import { PlaceIntelligenceService, PlaceSearchOption } from '../../../../services/place-intelligence.service';

@Component({
	selector: 'app-message-bubble',
	templateUrl: './message-bubble.component.html',
	styleUrls: ['./message-bubble.component.scss'],
})
export class MessageBubbleComponent implements OnInit {
	@Input() message!: ChatMessage;

	@Output() chipSelected = new EventEmitter<string>();
	@Output() formSubmitted = new EventEmitter<any>();
	@Output() categorySelected = new EventEmitter<any>();
	@Output() vehicleSelected = new EventEmitter<any>();
	@Output() confirmBooking = new EventEmitter<void>();
	@Output() editBooking = new EventEmitter<void>();

	dateValue = '';
	timeValue = '';
	today = '';
	passengers = 1;
	luggage = 0;
	hours = 2;

	customerForm = {
		first_name: '',
		last_name: '',
		phone: '',
		phone_isd: '+1',
		phone_country: 'us',
		email: '',
	};

	placeSearchText = '';
	placeOptions: PlaceSearchOption[] = [];
	placeLoading = false;
	showPlaceDropdown = false;
	private placeDebounceTimer: any;
	private placeSearchVersion = 0;

	constructor(private placeIntelligenceService: PlaceIntelligenceService) {}

	ngOnInit(): void {
		if (this.message.type === 'datetime-input') {
			const today = new Date();
			const yyyy = today.getFullYear();
			const mm = String(today.getMonth() + 1).padStart(2, '0');
			const dd = String(today.getDate()).padStart(2, '0');
			this.dateValue = `${yyyy}-${mm}-${dd}`;
			this.today = this.dateValue;
			this.timeValue = '09:00';
		}

		if (this.message.type === 'hours-input') {
			this.hours = Math.max(2, Number(this.message.meta?.value || 2));
		}
	}

	onPlaceInput(value: string) {
		this.placeSearchText = value;
		this.showPlaceDropdown = true;
		clearTimeout(this.placeDebounceTimer);
		if (!value.trim()) {
			this.placeOptions = [];
			this.placeLoading = false;
			return;
		}

		this.placeLoading = true;
		this.placeDebounceTimer = setTimeout(() => {
			void this.runPlaceSearch(value.trim());
		}, 250);
	}

	private async runPlaceSearch(text: string) {
		const version = ++this.placeSearchVersion;
		try {
			const options = await this.placeIntelligenceService.searchLocations(text);
			if (version !== this.placeSearchVersion) {
				return;
			}

			this.placeOptions = options;
			this.placeLoading = false;
			this.showPlaceDropdown = true;
		} catch {
			if (version === this.placeSearchVersion) {
				this.placeOptions = [];
				this.placeLoading = false;
			}
		}
	}

	async selectPlaceOption(option: PlaceSearchOption) {
		this.placeLoading = true;
		this.showPlaceDropdown = false;

		const selection = await this.placeIntelligenceService.resolveSelection(option);
		this.placeLoading = false;
		if (!selection) {
			return;
		}

		this.placeSearchText = selection.location.formattedAddress || selection.location.name;
		this.formSubmitted.emit({ selection });
	}

	onPlaceBlur() {
		setTimeout(() => {
			this.showPlaceDropdown = false;
		}, 200);
	}

	onChipClick(chip: ChatChip) {
		if (chip.value === 'CONFIRM') {
			this.confirmBooking.emit();
			return;
		}

		if (chip.value === 'EDIT') {
			this.editBooking.emit();
			return;
		}

		this.chipSelected.emit(chip.value);
	}

	submitDatetime() {
		if (!this.dateValue || !this.timeValue) {
			return;
		}
		this.formSubmitted.emit({ date: this.dateValue, time: this.timeValue });
	}

	submitPassengers() {
		this.formSubmitted.emit({ passengers: this.passengers, luggage: this.luggage });
	}

	submitHours() {
		this.formSubmitted.emit({ hours: Math.max(2, this.hours) });
	}

	submitCustomer() {
		if (!this.customerForm.first_name || !this.customerForm.last_name || !this.customerForm.phone || !this.customerForm.email) {
			return;
		}

		this.formSubmitted.emit({ ...this.customerForm });
	}

	increment(field: 'passengers' | 'luggage' | 'hours') {
		if (field === 'passengers') {
			this.passengers = Math.min(this.passengers + 1, 20);
		}
		if (field === 'luggage') {
			this.luggage = Math.min(this.luggage + 1, 20);
		}
		if (field === 'hours') {
			this.hours = Math.min(this.hours + 1, 24);
		}
	}

	decrement(field: 'passengers' | 'luggage' | 'hours') {
		if (field === 'passengers') {
			this.passengers = Math.max(this.passengers - 1, 1);
		}
		if (field === 'luggage') {
			this.luggage = Math.max(this.luggage - 1, 0);
		}
		if (field === 'hours') {
			this.hours = Math.max(this.hours - 1, 2);
		}
	}

	getPlaceOptionIcon(option: PlaceSearchOption): string {
		switch (option.predictedKind) {
			case 'airport':
				return 'fas fa-plane';
			case 'cruise':
				return 'fas fa-ship';
			case 'fbo':
				return 'fas fa-helicopter';
			default:
				return 'fas fa-map-marker-alt';
		}
	}

	getSummaryRows(): Array<{ label: string; value: string }> {
		return this.message.summaryRows || [];
	}
}
