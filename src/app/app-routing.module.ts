import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrebookingDataComponent } from './prebooking-data/prebooking-data.component';
import { PrebookFormComponent } from './prebook-form/prebook-form.component';
import { PrebookingReportComponent } from './prebooking-report/prebooking-report.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth.guard'; // Import AuthGuard
import { UpdatePrebookingFormComponent } from './update-prebooking-form/update-prebooking-form.component';
import { DeliveryLogBookComponent } from './delivery-log-book/delivery-log-book.component';
import { DeliveryLogTableComponent } from './delivery-log-table/delivery-log-table.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { HomeComponent } from './home/home.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

const routes: Routes = [
  { path: 'prebooking-data', component: PrebookingDataComponent, canActivate: [AuthGuard] },
  { path: 'prebook-form', component: PrebookFormComponent, canActivate: [AuthGuard] }, // For query parameters
  {  path: 'update-prebooking/:uniqueId', component: UpdatePrebookingFormComponent, canActivate: [AuthGuard]  },
  { path: 'prebooking-report', component: PrebookingReportComponent, canActivate: [AuthGuard] },
  { path: 'delivery-log-book', component: DeliveryLogBookComponent, canActivate: [AuthGuard] },
  { path: 'manage-user', component: ManageUserComponent, canActivate: [AuthGuard] },
  { path: 'activity-log', component: ActivityLogComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {   path: 'ticket-form/:uniqueId', component: TicketFormComponent, canActivate: [AuthGuard] },

  { path: 'delivery-log-table', component: DeliveryLogTableComponent, canActivate: [AuthGuard] },
  { path: 'auth', component: AuthComponent }, // No AuthGuard here
  { path: 'auth?mode=signup', component: AuthComponent, canActivate: [AuthGuard] }, // Guard on signup mode
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', component:PagenotfoundComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
