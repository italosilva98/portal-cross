import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';

const COMMON_COMPONENTS = [
  FormsModule,
  CommonModule,
  BrowserAnimationsModule,
  ReactiveFormsModule,
  DragDropModule,
];

@NgModule({
  declarations: [],
  imports: [COMMON_COMPONENTS],
  exports: [COMMON_COMPONENTS],
})
export class SharedModule {}
