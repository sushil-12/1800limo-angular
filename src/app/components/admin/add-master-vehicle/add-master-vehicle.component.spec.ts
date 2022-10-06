import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMasterVehicleComponent } from './add-master-vehicle.component';

describe('AddVehicleComponent', () =>
{
	let component: AddMasterVehicleComponent;
	let fixture: ComponentFixture<AddMasterVehicleComponent>;

	beforeEach(async(() =>
	{
		TestBed.configureTestingModule({
			declarations: [AddMasterVehicleComponent]
		})
			.compileComponents();
	}));

	beforeEach(() =>
	{
		fixture = TestBed.createComponent(AddMasterVehicleComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () =>
	{
		expect(component).toBeTruthy();
	});
});
