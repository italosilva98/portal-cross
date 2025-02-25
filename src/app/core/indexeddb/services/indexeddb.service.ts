import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import {
  AppDB,
  ICrossAllocations,
  ISquadRequests,
  ITaskBoard,
} from '../models/indexeddb.model';
import {
  CrossAllocationsDB,
  IndexedDB,
  SquadRequestsDB,
  TaskBoardDB,
} from '../constants/indexeddb.constant';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private get _db(): Promise<IDBPDatabase<AppDB>> {
    return openDB<AppDB>(IndexedDB.nome, IndexedDB.versao, {
      upgrade(db: IDBPDatabase<AppDB>) {
        Object.values(IndexedDB.stores).forEach((_store) => {
          const store = db.createObjectStore(_store.nome, {
            keyPath: _store.indices as unknown as string[],
          });
          _store.indices.forEach((indice) => {
            const indexName = `by-${indice}` as `by-${string}`;
            if (!store.indexNames.contains(indexName)) {
              store.createIndex(indexName, indice);
            }
          });
        });
      },
    });
  }

  // INICIO TASKS
  async getAllTasks(): Promise<ITaskBoard[]> {
    return (await this._db).getAll(TaskBoardDB.nome);
  }

  async getTaskById(id: string): Promise<ITaskBoard[]> {
    const task = await (await this._db).get(TaskBoardDB.nome, id);
    return task ? [task] : [];
  }

  async getTasksBySprint(sprint: string): Promise<ITaskBoard[]> {
    return (await this._db).getAllFromIndex(
      TaskBoardDB.nome,
      'by-sprint',
      sprint
    );
  }

  async getTasksByCrossName(crossName: string): Promise<ITaskBoard[]> {
    return (await this._db).getAllFromIndex(
      TaskBoardDB.nome,
      'by-crossName',
      crossName
    );
  }

  async getTasksByStatus(status: string): Promise<ITaskBoard[]> {
    return (await this._db).getAllFromIndex(
      TaskBoardDB.nome,
      'by-status',
      status
    );
  }

  async addTask(taskData: ITaskBoard): Promise<string> {
    return (await this._db).add(TaskBoardDB.nome, taskData);
  }

  async updateTask(taskData: ITaskBoard): Promise<string> {
    return (await this._db).put(TaskBoardDB.nome, taskData);
  }

  async deleteTask(id: string): Promise<void> {
    return (await this._db).delete(TaskBoardDB.nome, id);
  }

  // FIM TASKS

  // INICIO CROSS
  async getAllCrossMember(): Promise<ICrossAllocations[]> {
    return (await this._db).getAll(CrossAllocationsDB.nome);
  }

  async getCrossMemberById(id: string): Promise<ICrossAllocations[]> {
    const cross = await (await this._db).get(CrossAllocationsDB.nome, id);
    return cross ? [cross] : [];
  }

  async addCrossAllocations(crossData: ICrossAllocations): Promise<string> {
    return (await this._db).add(CrossAllocationsDB.nome, crossData);
  }

  async updateCrossAllocations(crossData: ICrossAllocations): Promise<string> {
    return (await this._db).put(CrossAllocationsDB.nome, crossData);
  }

  async deleteCrossAllocations(id: string): Promise<void> {
    return (await this._db).delete(CrossAllocationsDB.nome, id);
  }
  // FIM CROSS

  // INICIO SQUAD
  async getAllSquadRequests(): Promise<ISquadRequests[]> {
    return (await this._db).getAll(SquadRequestsDB.nome);
  }

  async getRequestsBySquad(squad: string): Promise<ISquadRequests[]> {
    const requests = await (await this._db).get(SquadRequestsDB.nome, squad);
    return requests ? [requests] : [];
  }

  async getRequestsByCrossMember(
    crossMember: string
  ): Promise<ISquadRequests[]> {
    const requests = await (
      await this._db
    ).get(SquadRequestsDB.nome, crossMember);
    return requests ? [requests] : [];
  }

  async addSquadRequests(squadRequestData: ISquadRequests): Promise<string> {
    return (await this._db).add(SquadRequestsDB.nome, squadRequestData);
  }

  async updateSquadRequests(squadRequestData: ISquadRequests): Promise<string> {
    return (await this._db).put(SquadRequestsDB.nome, squadRequestData);
  }

  async deleteSquadRequests(id: string): Promise<void> {
    return (await this._db).delete(SquadRequestsDB.nome, id);
  }
  // FIM SQUAD
}
