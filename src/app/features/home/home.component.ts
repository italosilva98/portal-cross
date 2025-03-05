import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @Output() setFlowEmitter = new EventEmitter<string>();

  setFlow(flow: string) {
    this.setFlowEmitter.emit(flow);
  }
}
