import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PrebookingDataComponent } from './prebooking-data/prebooking-data.component';
import { PrebookFormComponent } from './prebook-form/prebook-form.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AddProductDialogComponent } from './add-product-dialog/add-product-dialog.component';
import { RemoveProductDialogComponent } from './remove-product-dialog/remove-product-dialog.component';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { CapitalizePipe } from './capitalize.pipe';
import { FilterPipe } from './filter.pipe';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PrebookingReportComponent } from './prebooking-report/prebooking-report.component';
import { AuthComponent } from './auth/auth.component';
import { UpdatePrebookingFormComponent } from './update-prebooking-form/update-prebooking-form.component';
import { DeliveryLogBookComponent } from './delivery-log-book/delivery-log-book.component';
import { DeliveryLogTableComponent } from './delivery-log-table/delivery-log-table.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { HomeComponent } from './home/home.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';


@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    PrebookingDataComponent,
    PrebookFormComponent,
    AddProductDialogComponent,
    RemoveProductDialogComponent,
    FilterPipe,
    CapitalizePipe,
    PrebookingReportComponent,
    AuthComponent,
    UpdatePrebookingFormComponent,
    DeliveryLogBookComponent,
    DeliveryLogTableComponent,
    TicketFormComponent,
    ManageUserComponent,
    HomeComponent,
    ActivityLogComponent,
    PagenotfoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    NgxPaginationModule,
    NgxChartsModule,
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
