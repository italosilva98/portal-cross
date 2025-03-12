import { Component } from '@angular/core';
import { Filter } from 'src/app/shared/models/filter.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'TechPlain';
  currentRoute: string = 'dashboard';
  isMinimized: boolean = false;
  flowType: string = 'cross';
  isFlowActive = true;

  filter!: Filter;

  constructor() {}

  onRouteClicked(route: string) {
    this.currentRoute = route;

    if (route === 'home') {
      this.isFlowActive = false;
      this.flowType = '';
      this.currentRoute = 'dashboard';
    }
  }

  handleFlow(flow: string) {
    this.flowType = flow;
    this.isFlowActive = true;
  }

  handleFilter(filter: Filter) {
    this.filter = filter;
  }
}
