import { Injectable } from '@angular/core';
import { BaseIndexedDBService } from '../base/base-indexeddb.service';
import { ICrossAllocations } from '../../models/indexeddb.model';
import { CrossAllocationsDB } from '../../constants/indexeddb.constant';

@Injectable({
  providedIn: 'root',
})
export class CrossAllocationsService {
  constructor(private baseDB: BaseIndexedDBService<ICrossAllocations>) {}

  getAllCrossMembers(): Promise<ICrossAllocations[]> {
    return this.baseDB.getAll(CrossAllocationsDB.nome);
  }

  getCrossMemberById(id: string): Promise<ICrossAllocations | undefined> {
    return this.baseDB.getById(CrossAllocationsDB.nome, id);
  }

  addCrossAllocations(data: ICrossAllocations): Promise<string> {
    return this.baseDB.add(CrossAllocationsDB.nome, data);
  }

  updateCrossAllocations(data: ICrossAllocations): Promise<string> {
    return this.baseDB.update(CrossAllocationsDB.nome, data);
  }

  deleteCrossAllocations(id: string): Promise<void> {
    return this.baseDB.delete(CrossAllocationsDB.nome, id);
  }
}
