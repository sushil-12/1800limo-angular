import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { ErrorDialogComponent } from './errordialog/errordialog.component';
import { StateManagementService } from '../statemanagement.service';
declare var $: any;


@Injectable()
export class ErrorDialogService {
    public isDialogOpen: Boolean = false;
    constructor(public dialog: MatDialog,
        public stateManagementService: StateManagementService) { }
    openDialog(data): any {
        if (this.isDialogOpen) {
            return false;
        }
        this.stateManagementService.setError(data.errors);//set errors in service
        $('#globalErrorModal').modal('show');
    }
}