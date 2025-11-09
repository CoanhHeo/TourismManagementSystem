import { Routes } from '@angular/router';
import { BookingFormComponent } from './features/booking/booking-form/booking-form.component';
import { TourListComponent } from './features/tour/tour-list/tour-list.component';
import { TourBookingComponent } from './features/tour/tour-booking/tour-booking.component';
import { MyBookingsComponent } from './features/tour/my-bookings/my-bookings.component';
import { MyToursComponent } from './features/tour/my-tours/my-tours.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AddTourComponent } from './features/admin/add-tour/add-tour.component';
import { AddTourDepartureComponent } from './features/admin/add-tour-departure/add-tour-departure.component';
import { ManageToursComponent } from './features/admin/manage-tours/manage-tours.component';
import { EditTourComponent } from './features/admin/edit-tour/edit-tour.component';
import { ManageTourDeparturesComponent } from './features/admin/manage-tour-departures/manage-tour-departures.component';
import { EditTourDepartureComponent } from './features/admin/edit-tour-departure/edit-tour-departure.component';
import { ManageUsersComponent } from './features/admin/manage-users/manage-users.component';
import { AdminPromotionsComponent } from './features/admin/admin-promotions/admin-promotions.component';
import { AdminTourTypesComponent } from './features/admin/admin-tour-types/admin-tour-types.component';
import { adminGuard } from './core/guards/admin.guard';
import { tourGuideGuard } from './core/guards/tour-guide.guard';
import { TourGuideDashboardComponent } from './features/tour-guide/dashboard/tour-guide-dashboard.component';
import { PassengersListComponent } from './features/tour-guide/passengers/passengers-list.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'booking', component: BookingFormComponent },  // New route name
  { path: 'dangky', redirectTo: '/booking', pathMatch: 'full' },  // Legacy redirect
  { path: 'tours', component: TourListComponent },
  { path: 'tours/:id/book', component: TourBookingComponent },
  { path: 'my-bookings', component: MyBookingsComponent }, // Old route (keep for compatibility)
  { path: 'my-tours', component: MyToursComponent }, // New route
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
    path: 'admin/departures', 
    component: ManageTourDeparturesComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/departures/add', 
    component: AddTourDepartureComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/departures/edit/:id', 
    component: EditTourDepartureComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/users', 
    component: ManageUsersComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/promotions', 
    component: AdminPromotionsComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/tour-types', 
    component: AdminTourTypesComponent,
    canActivate: [adminGuard]
  },
  // 🎯 NEW: Tour Guide Routes
  { 
    path: 'tour-guide/dashboard', 
    component: TourGuideDashboardComponent,
    canActivate: [tourGuideGuard]
  },
  { 
    path: 'tour-guide/passengers/:departureId', 
    component: PassengersListComponent,
    canActivate: [tourGuideGuard]
  },
  { path: '', pathMatch: 'full', redirectTo: 'tours' },
  { path: '**', redirectTo: 'tours' }
];