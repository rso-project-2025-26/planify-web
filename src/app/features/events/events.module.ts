import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { EventsRoutingModule } from './events-routing.module';

// Components
import { EventListComponent } from './components/event-list/event-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';

@NgModule({
  declarations: [
    EventListComponent,
    EventDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    EventsRoutingModule
  ]
})
export class EventsModule { }
