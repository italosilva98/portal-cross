import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Filter } from 'src/app/shared/models/filter.model';
import { EventBusService } from 'src/app/shared/services/event-bus.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @Output() setFlowEmitter = new EventEmitter<string>();
  @Output() setFilterEmitter = new EventEmitter<Filter>();

  flow: string = '';
  showFilter: boolean = false;

  constructor(private eventBusService: EventBusService) {}

  setFlow(flow: string) {
    if (flow === 'squad') {
      this.flow = flow;
      this.showFilter = true;
    } else {
      this.setFlowEmitter.emit(flow);
    }
  }

  onSubmit(event: Filter) {
    this.setFilterEmitter.emit(event);
    this.setFlowEmitter.emit(this.flow);
    this.eventBusService.sendEvent<Filter>('filter', event);
  }
}
