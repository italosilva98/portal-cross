import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'TechPlain';
  currentRoute: string = 'dashboard';
  isMinimized: boolean = false;
  constructor() {}

  onRouteClicked(route: string) {
    this.currentRoute = route;
  }
}
