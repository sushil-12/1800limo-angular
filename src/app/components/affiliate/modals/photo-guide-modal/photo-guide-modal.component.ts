import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { PhotoGuide } from '../../add-vehicle-from-affiliate/photo-guide.config';

@Component({
  selector: 'app-photo-guide-modal',
  templateUrl: './photo-guide-modal.component.html',
  styleUrls: ['./photo-guide-modal.component.scss'],
})
export class PhotoGuideModalComponent implements OnChanges, OnDestroy {
  @Input() guide: PhotoGuide | null = null;
  @Input() isVisible = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();

  ngOnChanges(): void {
    document.body.style.overflow = this.isVisible ? 'hidden' : '';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
