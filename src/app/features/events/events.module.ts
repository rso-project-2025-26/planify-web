import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { EventsRoutingModule } from './events-routing.module';

// Components
import { EventListComponent } from './components/event-list/event-list.component';

@NgModule({
  declarations: [
    EventListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    EventsRoutingModule
  ]
})
export class EventsModule { }
