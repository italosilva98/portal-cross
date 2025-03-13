import { Injectable } from '@angular/core';
import { BaseIndexedDBService } from '../base/base-indexeddb.service';
import { SquadRequestsDB } from '../../constants/indexeddb.constant';
import { ISquadRequests } from '../../models/indexeddb.model';

@Injectable({
  providedIn: 'root',
})
export class SquadRequestsService {
  constructor(private baseDB: BaseIndexedDBService<ISquadRequests>) {}

  getAllSquadRequests(): Promise<ISquadRequests[]> {
    return this.baseDB.getAll(SquadRequestsDB.nome);
  }

  getRequestsBySquad(squad: string): Promise<ISquadRequests[]> {
    return this.baseDB.getByIndex(SquadRequestsDB.nome, 'by-squad', squad);
  }

  getRequestsBySquadAndEmployeeName(
    squad: string,
    employeeName: string,
    release: string,
    sprint: string
  ): Promise<ISquadRequests[]> {
    return this.baseDB
      .getAll(SquadRequestsDB.nome)
      .then((requests: ISquadRequests[]) => {
        return requests.filter(
          (request) =>
            request.squad === squad &&
            request.employeeName === employeeName &&
            request.release === release &&
            request.sprint === sprint
        );
      });
  }

  getRequestsByEmployeeName(employeeName: string): Promise<ISquadRequests[]> {
    return this.baseDB.getByIndex(
      SquadRequestsDB.nome,
      'by-employeeName',
      employeeName
    );
  }

  addSquadRequests(data: ISquadRequests): Promise<string> {
    return this.baseDB.add(SquadRequestsDB.nome, data);
  }

  updateSquadRequests(data: ISquadRequests): Promise<string> {
    return this.baseDB.update(SquadRequestsDB.nome, data);
  }

  deleteSquadRequests(id: string): Promise<void> {
    return this.baseDB.delete(SquadRequestsDB.nome, id);
  }
}
