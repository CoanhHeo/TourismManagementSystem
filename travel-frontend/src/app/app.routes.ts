import { Routes } from '@angular/router';
import { DangkyFormComponent } from '../features/dangky/dangky-form/dangky-form.component';
import { TourListComponent } from '../features/tour/tour-list/tour-list.component';
import { TourBookingComponent } from '../features/tour/tour-booking/tour-booking.component';
import { MyBookingsComponent } from '../features/tour/my-bookings/my-bookings.component';
import { RegisterComponent } from '../features/auth/register/register.component';
import { LoginComponent } from '../features/auth/login/login.component';
import { AdminDashboardComponent } from '../features/admin/admin-dashboard/admin-dashboard.component';
import { AddTourComponent } from '../features/admin/add-tour/add-tour.component';
import { AddTourDepartureComponent } from '../features/admin/add-tour-departure/add-tour-departure.component';
import { ManageToursComponent } from '../features/admin/manage-tours/manage-tours.component';
import { EditTourComponent } from '../features/admin/edit-tour/edit-tour.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dangky', component: DangkyFormComponent },
  { path: 'tours', component: TourListComponent },
  { path: 'tours/:id/book', component: TourBookingComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/tours', 
    component: ManageToursComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/tours/add', 
    component: AddTourComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/tours/edit/:id', 
    component: EditTourComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/departures/add', 
    component: AddTourDepartureComponent,
    canActivate: [adminGuard]
  },
  { path: '', pathMatch: 'full', redirectTo: 'tours' },
  { path: '**', redirectTo: 'tours' }
];