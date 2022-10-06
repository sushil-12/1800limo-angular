import { Component, EventEmitter, Input, OnInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent implements OnInit {

  @Input() modalImage: string;

  constructor() { }

  closeButton() {
    $("#imageModal").addClass("d-none");
    $("#imageModal").removeClass("showImage");
  }
  ngOnInit(): void {
    console.log(this.modalImage)
  }

}
