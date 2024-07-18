import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class StateManagementService {

	constructor() { }

	//state for global errors
	private errors = new BehaviorSubject({});
	setError(value) {
		this.errors.next(value);
	}
	getError() {
		return this.errors;
	}

	//state for progressBar
	private progressBar = new BehaviorSubject(false);
	setprogressBar(value) {
		this.progressBar.next(value);
	}
	getprogressBar() {
		return this.progressBar;
	}

	//state for global number of vehicles
	private numOfVehicles = 0;
	private numberOfVehicles = new BehaviorSubject(0);
	setNumberOfVehicles(value) {
		this.numOfVehicles = value;
		this.numberOfVehicles.next(value);
	}
	addNumberOfVehicles(value) {
		this.numOfVehicles = value + this.numOfVehicles;
		this.numberOfVehicles.next(this.numOfVehicles);
	}
	getNumberOfVehicles() {
		return this.numberOfVehicles;
	}

	//Login-Logout
	setUser() {
		JSON.parse(localStorage.getItem("currentUser"));
	}
	getUser() {
		return JSON.parse(localStorage.getItem("currentUser"));
	}
	removeUser() {
		// remove user from local storage to logout user
		localStorage.clear();
		sessionStorage.clear();

	}

	getCurrencySymbol() {
		return JSON.parse(localStorage.getItem('currencySymbol'))
	}


	private state = new BehaviorSubject({})
	set(value: any) {
		this.state.next(value)
	}
	get() {
		return this.state
	}


}
