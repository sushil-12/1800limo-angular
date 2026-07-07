import { CommonModule } from "@angular/common";
import { AffiliateBookingHostComponent } from "./affiliate-booking-host.component";
import { BookingSharedModule } from "../../shared/booking/booking-shared.module";
import { NgModule } from "@angular/core";

@NgModule({
    declarations: [AffiliateBookingHostComponent],
    imports: [CommonModule, BookingSharedModule],
    exports: [AffiliateBookingHostComponent],
})
export class AffiliateBookingHostModule { }

