import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-affiliate',
  templateUrl: './affiliate.component.html',
  styleUrls: ['./affiliate.component.scss']
})
export class AffiliateComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $(".modal-body").prepend(" <button type='button' class='close' data-dismiss='modal' aria-label='Close'> <span aria-hidden='true'>&times;</span> </button> ");
  }

}
