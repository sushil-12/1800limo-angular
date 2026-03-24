import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { PlaceAutocompleteFieldComponent } from './place-autocomplete-field.component';

@Component({
	standalone: true,
	imports: [ReactiveFormsModule, PlaceAutocompleteFieldComponent],
	template: `<app-place-autocomplete-field [formControl]="fc" placeholder="Addr"></app-place-autocomplete-field>`,
})
class TestHostComponent {
	fc = new FormControl('Initial');
}

describe('PlaceAutocompleteFieldComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;

	beforeEach(async () => {
		(window as unknown as { google?: object }).google = {
			maps: {
				importLibrary: jasmine.createSpy('importLibrary').and.returnValue(
					Promise.resolve({
						PlaceAutocompleteElement: function PlaceAutocompleteElement(this: HTMLElement) {
							const el = document.createElement('div');
							el.tagName = 'GMP-PLACE-AUTOCOMPLETE';
							return el as unknown as HTMLElement;
						},
					})
				),
				places: {},
			},
		};

		await TestBed.configureTestingModule({
			imports: [TestHostComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		fixture.detectChanges();
	});

	it('should create host with form control', () => {
		expect(fixture.componentInstance).toBeTruthy();
		expect(fixture.componentInstance.fc.value).toBe('Initial');
	});

	it('should propagate writeValue to the field', () => {
		fixture.componentInstance.fc.setValue('Patched');
		fixture.detectChanges();
		expect(fixture.componentInstance.fc.value).toBe('Patched');
	});
});
