import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentByEmailComponent } from './payment-by-email.component';

const routes: Routes = [{ path: '', component: PaymentByEmailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentByEmailRoutingModule { }
