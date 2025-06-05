import { Component, OnInit } from '@angular/core';
import { ITaskBoard } from '@indexeddb/models/indexeddb.model';
import { TaskService } from '@indexeddb/services/task/task.service';

@Component({
  selector: 'app-tablet-tasks',
  templateUrl: './tablet-tasks.component.html',
  styleUrls: ['./tablet-tasks.component.scss'],
})
export class TabletTasksComponent implements OnInit {
  tasks: ITaskBoard[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getAllTasks().then((tasks) => (this.tasks = tasks));
  }
}
