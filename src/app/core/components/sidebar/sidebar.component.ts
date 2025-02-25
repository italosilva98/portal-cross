import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Output() routeClicked = new EventEmitter<string>();
  @Output() isMinimizedClicked = new EventEmitter<boolean>();

  activeRoute = 'dashboard';
  isMinimized = false;

  toggleSidebar() {
    this.isMinimized = !this.isMinimized;
    this.isMinimizedClicked.emit(this.isMinimized)
  }

  navigate(route: string) {
    this.routeClicked.emit(route);
    this.activeRoute = route;

  }
}
