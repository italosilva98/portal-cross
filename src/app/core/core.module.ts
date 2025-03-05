import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [SidebarComponent],
  imports: [CommonModule, SharedModule],
  exports: [SidebarComponent, SharedModule],
})
export class CoreModule {}
