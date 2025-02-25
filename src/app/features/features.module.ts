import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/page/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { KanbanComponent } from './kanban/page/kanban.component';
import { ActivityLogComponent } from './activity-log/page/activity-log.component';
import { AllocationsComponent } from './allocations/allocations.component';

const COMPONENTS = [
  DashboardComponent,
  KanbanComponent,
  ActivityLogComponent,
  AllocationsComponent,
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [SharedModule],
  exports: [COMPONENTS],
})
export class FeaturesModule {}
