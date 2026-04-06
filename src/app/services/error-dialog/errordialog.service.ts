import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { ErrorDialogComponent } from './errordialog/errordialog.component';
import { StateManagementService } from '../statemanagement.service';
declare var $: any;


@Injectable()
export class ErrorDialogService {
    public isDialogOpen: Boolean = false;
    private modalHandlersRegistered = false;

    constructor(public dialog: MatDialog,
        public stateManagementService: StateManagementService) { }

    private registerModalStateHandlers(): void {
        if (this.modalHandlersRegistered || !$('#globalErrorModal').length) {
            return;
        }

        $('#globalErrorModal')
            .off('.errorDialog')
            .on('shown.bs.modal.errorDialog', () => {
                this.isDialogOpen = true;
            })
            .on('hidden.bs.modal.errorDialog', () => {
                this.isDialogOpen = false;
                this.stateManagementService.setError({});
            });

        this.modalHandlersRegistered = true;
    }

    private hasRenderableErrors(data: any): boolean {
        if (!data || !data.errors || typeof data.errors !== 'object') {
            return false;
        }

        return Object.values(data.errors).some((value: any) => String(value ?? '').trim().length > 0);
    }

    openDialog(data): any {
        this.registerModalStateHandlers();
        if (!this.hasRenderableErrors(data)) {
            this.closeDialog();
            return false;
        }
        if (this.isDialogOpen) {
            return false;
        }
        this.stateManagementService.setError(data.errors);//set errors in service
        $('#globalErrorModal').modal('show');
    }

    closeDialog(): void {
        this.registerModalStateHandlers();
        const modal = $('#globalErrorModal');

        if (modal.hasClass('show')) {
            modal.modal('hide');
            return;
        }

        this.isDialogOpen = false;
        this.stateManagementService.setError({});
        modal.removeClass('show').css('display', 'none').attr('aria-hidden', 'true');
        $('body').removeClass('modal-open').css('padding-right', '');
        $('.modal-backdrop').remove();
    }
}
