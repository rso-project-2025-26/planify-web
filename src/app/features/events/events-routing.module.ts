import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { EventCreateComponent } from './components/event-create/event-create.component';
import { EventEditComponent } from './components/event-edit/event-edit.component';
import { authGuard } from '@auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'public',
    pathMatch: 'full'
  },
  {
    path: 'public',
    component: EventListComponent,
    data: { eventType: 'public' }
  },
  {
    path: 'my-events',
    component: EventListComponent,
    canActivate: [authGuard(['uporabnik'])],
    data: { eventType: 'my-events' }
  },
  { 
    path: 'create',
    component: EventCreateComponent,
    canActivate: [authGuard(['organiser', 'org_admin'])]
  },
  { 
    path: ':id/edit',
    component: EventEditComponent,
    canActivate: [authGuard(['organiser', 'org_admin'])]
  },
  {
    path: ':id',
    component: EventDetailComponent,
    canActivate: [authGuard(['uporabnik'])]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { }