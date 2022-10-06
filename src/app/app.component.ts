import { Component, AfterViewChecked, OnInit } from '@angular/core';
import { StateManagementService } from './services/statemanagement.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'limo1800';
  errors:any;

  constructor(public stateManagementService: StateManagementService){}

  ngOnInit():void{
    this.stateManagementService.getError().subscribe(data => {
      this.errors=data;
    });
    //set user state
    this.stateManagementService.setUser();
  }

}
