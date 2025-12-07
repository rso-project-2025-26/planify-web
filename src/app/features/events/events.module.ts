import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { EventsRoutingModule } from './events-routing.module';

// Components
import { PublicEventsComponent } from './components/public-events/public-events.component';

@NgModule({
  declarations: [
    PublicEventsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    EventsRoutingModule
  ]
})
export class EventsModule { }
