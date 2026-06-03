import { Component, Input } from '@angular/core';

type CameraAngle = 'front-left' | 'rear-right' | 'side' | 'interior-front'
  | 'interior-rear' | 'dashboard' | 'trunk' | 'detail' | 'doc';

@Component({
  selector: 'app-camera-angle-diagram',
  templateUrl: './camera-angle-diagram.component.html',
})
export class CameraAngleDiagramComponent {
  @Input() angle: CameraAngle | undefined;
}
