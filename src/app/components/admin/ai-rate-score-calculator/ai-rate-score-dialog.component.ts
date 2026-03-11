import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AiRateScoreVehicleContext } from './ai-rate-score-calculator.component';

export interface AiRateScoreDialogData {
	ratesData: Record<string, unknown>;
	vehicleContext: AiRateScoreVehicleContext;
}

@Component({
	selector: 'app-ai-rate-score-dialog',
	templateUrl: './ai-rate-score-dialog.component.html',
	styleUrls: ['./ai-rate-score-dialog.component.scss'],
})
export class AiRateScoreDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<AiRateScoreDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: AiRateScoreDialogData
	) {}

	close(): void {
		this.dialogRef.close();
	}
}
