import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SharedModule } from '../shared/shared.module';
import { CustomFilterComponent } from './components/custom-filter/custom-filter.component';

@NgModule({
  declarations: [SidebarComponent, CustomFilterComponent],
  imports: [CommonModule, SharedModule],
  exports: [SidebarComponent, CustomFilterComponent],
})
export class CoreModule {}
