import { Component, OnInit, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { CommonService } from 'src/app/services/common.service';
import * as intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @ViewChild('cellInput') cellInput!: ElementRef;

  public profile_pic: any;
  public imageSrc: string;
  public affiliateEmailProgressBar: boolean = false;
  public snackbarMsg: string;
  public modalImage: string;
  public AffiliatePhoneObject: any;
  @Input() closeTab: EventEmitter<any> = new EventEmitter();
  timezoneForm: FormGroup;

  constructor(
    private affiliateService: AffiliateService,
    private stateManagementService: StateManagementService,
    private router: Router,
    private fb: FormBuilder,
    private commonServices: CommonService,
    private $api: AdminService,
  ) { }

  ngOnInit(): void {

    this.timezoneForm = this.fb.group({
      timezone: [''],
    });
    this.stateManagementService.setprogressBar(true); //show progressbar
    this.affiliateService.getProfileDetail()
      .pipe(
        catchError(err => {
          this.stateManagementService.setprogressBar(false);//hide progressbar
          return throwError(err);
        })
      ).subscribe(({ data }: any) => {
        this.stateManagementService.setprogressBar(false);//hide progressbar
        this.timezoneForm.patchValue({
          timezone: data?.timezone
        })
        this.profile_pic = data?.profile_pic;
        let userInfo = JSON.parse(localStorage.getItem('userData'))
        if (userInfo) {
          userInfo['profile_picture'] = data?.profile_pic
          localStorage.setItem('userData', JSON.stringify(userInfo))
        }
        console.log('--->> profile pic--->>>', this.profile_pic)
        let first_name: any = document.getElementById('first_name');
        first_name.value = data?.first_name;
        let middle_name: any = document.getElementById('middle_name');
        middle_name.value = data?.middle_name;
        let last_name: any = document.getElementById('last_name');
        last_name.value = data?.last_name;
        let email: any = document.getElementById('email');
        email.value = data?.email;
        let phone: any = document.getElementById('phone');
        phone.value = data?.phone;
        //set country flag in phone number fields
        this.AffiliatePhoneObject.setCountry(data?.phone_country);
      });
    $('.HeadingH1').css({ display: "none" })

  }

  ngAfterViewInit() {

    const telOptions = {
      initialCountry: 'us',
      preferredCountries: ['us', 'ca', 'mx', 'gb'],
      separateDialCode: true,
      nationalMode: false,
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
    };

    // Cell Number
    this.AffiliatePhoneObject = intlTelInput(this.cellInput.nativeElement, telOptions);
  }

  telInputObjectCell(obj) {
    this.AffiliatePhoneObject = obj;
  }
  async profile_pic_change(event) {
    if (!await this.commonServices.handleFile(event)) {
      return;
    }
    this.stateManagementService.setprogressBar(true);//show progressbar
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageSrc = reader.result as string;
        this.affiliateService.uploadProfilePicture(this.imageSrc)
          .pipe(
            catchError(err => {
              this.stateManagementService.setprogressBar(false);//hide progressbar
              return throwError(err);
            })
          )
          .subscribe(({ data, message }: any) => {
            this.profile_pic = data.image;
            let userInfo = JSON.parse(localStorage.getItem('userData'))
            if (userInfo) {
              userInfo['profile_picture'] = data?.image
              localStorage.setItem('userData', JSON.stringify(userInfo))
            }
            this.stateManagementService.setprogressBar(false);//hide progressbar
            this.snackbarMsg = message;
            this.openSnackbar();
            window.location.reload()
          });
      };
    }
  }

  deactivateAffiliateAccount() {
    this.stateManagementService.setprogressBar(true);//show progressbar
    this.affiliateService.deactivateAffiliateAccount()
      .pipe(
        catchError(err => {
          this.stateManagementService.setprogressBar(false);//hide progressbar
          return throwError(err);
        })
      )
      .subscribe(({ data, message }: any) => {
        this.stateManagementService.setprogressBar(false);//hide progressbar
        this.snackbarMsg = message;
        this.openSnackbar();
        this.router.navigate(['/affiliate/step2']);
      });
  }
  onTimezoneChange(event: any): void {
    const selectedValue = event.value;
    console.log('Selected Timezone:', selectedValue);
    this.$api
      .changeTimezone(selectedValue)
      .pipe()
      .subscribe((response: any) => {
        console.log(response, 'timezone changed success');
      });

  }
  closeButton() {
    this.closeTab.emit();
  }

  showImageInModal(imageUrl) {
    this.modalImage = imageUrl;
    // console.log("11111",imageUrl)
    $("#imageModal").addClass("showImage");
    $("#imageModal").removeClass("d-none");
    // $("#imageModal").show();
  }

  openSnackbar() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 5000);
  }
}
