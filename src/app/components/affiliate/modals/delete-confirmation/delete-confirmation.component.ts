import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss']
})
export class DeleteConfirmationComponent implements OnInit {

  constructor() { }
  @Output() deleteRecord: EventEmitter<any> = new EventEmitter();
  @Input() alertMessage: string;
  
  ngOnInit(): void {
    console.log(this.alertMessage)
  }

  delete() {
    this.deleteRecord.emit();
  }

}
