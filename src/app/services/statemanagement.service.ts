import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class StateManagementService
{

	constructor() { }

	//state for global errors
	private errors = new BehaviorSubject({});
	setError(value)
	{
		this.errors.next(value);
	}
	getError()
	{
		return this.errors;
	}

	//state for progressBar
	private progressBar = new BehaviorSubject(false);
	setprogressBar(value)
	{
		this.progressBar.next(value);
	}
	getprogressBar()
	{
		return this.progressBar;
	}

	//state for global number of vehicles
	private numOfVehicles = 0;
	private numberOfVehicles = new BehaviorSubject(0);
	setNumberOfVehicles(value)
	{
		this.numOfVehicles = value;
		this.numberOfVehicles.next(value);
	}
	addNumberOfVehicles(value)
	{
		this.numOfVehicles = value + this.numOfVehicles;
		this.numberOfVehicles.next(this.numOfVehicles);
	}
	getNumberOfVehicles()
	{
		return this.numberOfVehicles;
	}

	//Login-Logout
	public currentUser = new BehaviorSubject('');
	setUser()
	{
		const value = JSON.parse(localStorage.getItem("currentUser"));
		this.currentUser.next(value);
	}
	getUser()
	{
		return this.currentUser;
	}
	removeUser()
	{
		this.currentUser.next('');

		// remove user from local storage to logout user
		localStorage.removeItem('currentUser');
		localStorage.removeItem('access_token');
		localStorage.removeItem('account_approval');
		localStorage.removeItem('recject_cause_message');
		localStorage.removeItem('stepCompleted');
		localStorage.removeItem('step_completed_obj');
		localStorage.removeItem('userData')
	}


	private state = new BehaviorSubject({})
	setState(value: any)
	{
		this.state.next(value)
	}
	getState()
	{
		return this.state
	}


}
