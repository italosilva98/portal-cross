import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CustomFilterComponent } from './components/custom-filter/custom-filter.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const COMMON_COMPONENTS = [
  FormsModule,
  CommonModule,
  BrowserAnimationsModule,
  ReactiveFormsModule,
  DragDropModule,
  FontAwesomeModule
];

const SHARED_COMPONENTS = [CustomFilterComponent];

@NgModule({
  declarations: [SHARED_COMPONENTS],
  imports: [COMMON_COMPONENTS],
  exports: [COMMON_COMPONENTS, SHARED_COMPONENTS],
})
export class SharedModule {}
