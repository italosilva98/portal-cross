import { Component, OnInit } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { ITaskBoard } from '@indexeddb/models/indexeddb.model';
import { TaskService } from '@indexeddb/services/task/task.service';

@Component({
  selector: 'app-tablet-tasks',
  templateUrl: './tablet-tasks.component.html',
  styleUrls: ['./tablet-tasks.component.scss'],
})
export class TabletTasksComponent implements OnInit {
  tasks: ITaskBoard[] = [];

  private exampleTasks: ITaskBoard[] = [
    {
      id: uuidv4(),
      title: 'Tarefa 1',
      description: 'Primeira tarefa de exemplo',
      status: 'To Do',
      sprint: 'Sprint 1',
      release: 'R1',
      allocatedHours: 0,
      spentHours: 0,
      employeeName: 'Usuário',
      createdDate: new Date(),
      updatedDate: new Date(),
      squad: 'S1',
      priority: 'Baixa',
      tasks: [],
    },
    {
      id: uuidv4(),
      title: 'Tarefa 2',
      description: 'Segunda tarefa de exemplo',
      status: 'In Progress',
      sprint: 'Sprint 1',
      release: 'R1',
      allocatedHours: 0,
      spentHours: 0,
      employeeName: 'Usuário',
      createdDate: new Date(),
      updatedDate: new Date(),
      squad: 'S1',
      priority: 'Média',
      tasks: [],
    },
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getAllTasks().then((tasks) => {
      if (tasks.length === 0) {
        this.exampleTasks.forEach((t) => this.taskService.addTask(t));
        this.tasks = this.exampleTasks;
      } else {
        this.tasks = tasks;
      }
    });
  }
}
