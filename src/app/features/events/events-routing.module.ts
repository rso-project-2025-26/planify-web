import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { EventCreateComponent } from './components/event-create/event-create.component';
import { EventEditComponent } from './components/event-edit/event-edit.component';

const routes: Routes = [
  {
    path: '',
    component: EventListComponent
  },
  { 
    path: 'create',
    component: EventCreateComponent
  },
  { 
    path: ':id/edit',
    component: EventEditComponent
  },
  {
    path: ':id',
    component: EventDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { }
