import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {ThemePalette} from '@angular/material/core';
declare var $: any;

@Component({
  selector: 'app-affiliate-preference',
  templateUrl: './affiliate-preference.component.html',
  styleUrls: ['./affiliate-preference.component.scss']
})
export class AffiliatePreferenceComponent implements OnInit {

  colorToggle: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  affilatePreference:any;
  affilatePreferenceRes:any;

  public addAffilatePreferenceForm: FormGroup;
  public editAffilatePreferenceForm: FormGroup;
  
  public submitted=false;
  public submittedEditForm=false;
  public response:any;
  public disableAddButton:boolean=false;
  public disableEditButton:boolean=false;
  currentUser:any;

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

        /** spinner starts on init */
        this.spinner.show();

        // Load Our affilatePreference using API
        this.adminService.getAffilatePreferenceList().then(result=>{
          this.affilatePreferenceRes=result;
          this.affilatePreference=this.affilatePreferenceRes.data;
          sessionStorage.setItem('affilatePreference',JSON.stringify(this.affilatePreference));
          this.spinner.hide();//hide spinner
        });
        this.currentUser = JSON.parse(localStorage.getItem("currentUser"));

        //add affilatePreference type form validation
        this.addAffilatePreferenceForm = this.formBuilder.group({
          name: ['', Validators.required]
        });

        //edit affilatePreference type form validation
        this.editAffilatePreferenceForm = this.formBuilder.group({
          id: ['', Validators.required],
          name: ['', Validators.required]
        });
  }

  serach(val)
  {
    let allAffilatePreference=JSON.parse(sessionStorage.getItem('affilatePreference'));
    let searchAffilatePreference = allAffilatePreference.filter(function(affilatePreference) {
      if(affilatePreference.name.toLowerCase().search(val)!=-1)
      {
        return true;
      }
    });
    this.affilatePreference=searchAffilatePreference;
  }

  get f(){
    return this.addAffilatePreferenceForm.controls;
  }

  submitForm()
  {
    this.submitted = true;
    // stop here if form is invalid
    if (this.addAffilatePreferenceForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableAddButton=true; //disable submit button

    this.adminService.addAffilatePreference(this.addAffilatePreferenceForm.value)
    .pipe(
        catchError(err => {
          $('#addAffilatePreferenceModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#addAffilatePreferenceModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/affiliate-preference']);
      }); 
    });
  }

  editAffilatePreference(id)
  {
    this.spinner.show();

    this.adminService.getAffilatePreference(id)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;

      this.editAffilatePreferenceForm.patchValue({  
        id: this.response.data.id,  
        name:this.response.data.name
      });
      $('#editAffilatePreferenceModal').modal('show');
      this.spinner.hide();//hide spinner
    });
  }

  get fEdit(){
    return this.editAffilatePreferenceForm.controls;
  }
  updateAffilatePreferenceForm()
  {
    this.submittedEditForm = true;
    // stop here if form is invalid
    if (this.editAffilatePreferenceForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableEditButton=true; //disable submit button

    this.adminService.updateAffilatePreference(this.editAffilatePreferenceForm.value)
    .pipe(
        catchError(err => {
          $('#editAffilatePreferenceModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#editAffilatePreferenceModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/affiliate-preference']);
      }); 
    });
  }

  enableDisableClicked(event,id)
  {
    this.spinner.show();//show spinner
    console.log(event.checked);
    if(event.checked)
    {
      var status='enable';
    }
    else
    {
      var status='disable';
    }
    this.adminService.affilatePreferenceStatus(id,status)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    ).subscribe(result=>{

      this.spinner.hide();//hide spinner
    });
  }

}

