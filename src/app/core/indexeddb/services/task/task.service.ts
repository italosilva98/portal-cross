import { Injectable } from '@angular/core';
import { BaseIndexedDBService } from '../base/base-indexeddb.service';
import { TaskBoardDB } from '../../constants/indexeddb.constant';
import { ITaskBoard } from '../../models/indexeddb.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private baseDB: BaseIndexedDBService<ITaskBoard>) {}

  getAllTasks(): Promise<ITaskBoard[]> {
    return this.baseDB.getAll(TaskBoardDB.nome);
  }

  getTaskById(id: string): Promise<ITaskBoard | undefined> {
    return this.baseDB.getById(TaskBoardDB.nome, id);
  }

  getTasksBySprint(sprint: string): Promise<ITaskBoard[]> {
    return this.baseDB.getByIndex(TaskBoardDB.nome, 'by-sprint', sprint);
  }
  getTasksByRelease(release: string): Promise<ITaskBoard[]> {
    return this.baseDB.getByIndex(TaskBoardDB.nome, 'by-release', release);
  }

  getTasksByCrossName(crossName: string): Promise<ITaskBoard[]> {
    return this.baseDB.getByIndex(TaskBoardDB.nome, 'by-crossName', crossName);
  }

  getTasksByStatus(status: string): Promise<ITaskBoard[]> {
    return this.baseDB.getByIndex(TaskBoardDB.nome, 'by-status', status);
  }

  addTask(task: ITaskBoard): Promise<string> {
    return this.baseDB.add(TaskBoardDB.nome, task);
  }

  updateTask(task: ITaskBoard): Promise<string> {
    return this.baseDB.update(TaskBoardDB.nome, task);
  }

  deleteTask(id: string): Promise<void> {
    return this.baseDB.delete(TaskBoardDB.nome, id);
  }
}
