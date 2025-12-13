import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { EventsRoutingModule } from './events-routing.module';

// Components
import { EventListComponent } from './components/event-list/event-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventCreateComponent } from './components/event-create/event-create.component';
import { EventEditComponent } from './components/event-edit/event-edit.component';

@NgModule({
  declarations: [
    EventListComponent,
    EventDetailComponent,
    EventFormComponent,
    EventCreateComponent,
    EventEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    EventsRoutingModule
  ]
})
export class EventsModule { }
