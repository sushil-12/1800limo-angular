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
    if (this.cellInput) {
      let countryCode = 'auto';
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && (currentUser.phoneCountry || currentUser.country)) {
        countryCode = currentUser.phoneCountry || currentUser.country;
      }
      const telOptions: any = this.commonServices.getTelInputOptions(countryCode);
      this.AffiliatePhoneObject = intlTelInput(this.cellInput.nativeElement, telOptions);

      this.addCustomCountrySearch(this.cellInput.nativeElement);
    }
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

  private addCustomCountrySearch(element: HTMLElement) {
    element.addEventListener('open:countrydropdown', () => {
      const container = element.closest('.iti');
      const dropdown = container?.querySelector('.iti__country-list');
      if (!dropdown) return;

      // Check if search already exists
      if (dropdown.querySelector('.iti-search-input')) return;

      // Create search container
      const searchContainer = document.createElement('div');
      searchContainer.className = 'iti-search-container';

      // Create search input
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'iti-search-input';
      searchInput.placeholder = 'Search country...';

      searchContainer.appendChild(searchInput);

      // Prevent dropdown from closing when interacting with search
      searchInput.addEventListener('click', (e) => e.stopPropagation());
      searchInput.addEventListener('keydown', (e) => e.stopPropagation());

      // Insert at top of dropdown
      dropdown.insertBefore(searchContainer, dropdown.firstChild);

      // Focus on search
      setTimeout(() => searchInput.focus(), 100);

      // Filter countries on input
      searchInput.addEventListener('input', (e: any) => {
        e.stopPropagation();
        const searchTerm = e.target.value.toLowerCase();
        const countries = dropdown.querySelectorAll('.iti__country');
        let hasVisible = false;

        countries.forEach((country: any) => {
          // Search in the full text (Name + Dial Code)
          const text = country.textContent?.toLowerCase() || '';

          if (text.includes(searchTerm)) {
            country.classList.remove('iti__hide');
            country.style.display = 'block'; // Force show
            hasVisible = true;
          } else {
            country.classList.add('iti__hide');
            country.style.display = 'none'; // Force hide
          }
        });

        // Handle No Results
        let noResults = dropdown.querySelector('.iti-no-results');
        if (!noResults) {
          noResults = document.createElement('div');
          noResults.className = 'iti-no-results';
          noResults.textContent = 'No results found';
          dropdown.appendChild(noResults);
        }

        if (!hasVisible && searchTerm) {
          (noResults as HTMLElement).style.display = 'block';
        } else {
          (noResults as HTMLElement).style.display = 'none';
        }

        // Show all if search is empty
        if (!searchTerm) {
          countries.forEach((country: any) => {
            country.classList.remove('iti__hide');
            country.style.display = 'block';
          });
          (noResults as HTMLElement).style.display = 'none';
        }
      });
    });
  }
}
