import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

import { AppDB } from '../../models/indexeddb.model';
import { IndexedDB } from '../../constants/indexeddb.constant';
import { EntityType, IndexName, StoreName } from '../../models/indexeddb.types';

@Injectable({
  providedIn: 'root',
})
export class BaseIndexedDBService<T extends EntityType> {
  private _db: Promise<IDBPDatabase<AppDB>>;

  constructor() {
    this._db = openDB<AppDB>(IndexedDB.nome, IndexedDB.versao, {
      upgrade(db: IDBPDatabase<AppDB>) {
        Object.values(IndexedDB.stores).forEach((_store) => {
          if (!db.objectStoreNames.contains(_store.nome)) {
            const store = db.createObjectStore(_store.nome, {
              keyPath: 'id',
            });
            _store.indices.forEach((indice) => {
              const indexName = `by-${indice}` as `by-${string}`;
              if (!store.indexNames.contains(indexName)) {
                store.createIndex(indexName, indice);
              }
            });
          }
        });
      },
    });
  }

  async getAll(storeName: StoreName): Promise<T[]> {
    return (await this._db).getAll(storeName) as unknown as T[];
  }

  async getById(storeName: StoreName, id: string): Promise<T | undefined> {
    return (await this._db).get(storeName, id) as unknown as T | undefined;
  }

  async getByIndex(
    storeName: StoreName,
    indexName: IndexName,
    query: string
  ): Promise<T[]> {
    return (await this._db).getAllFromIndex(
      storeName,
      indexName,
      query
    ) as unknown as T[];
  }

  async add(storeName: StoreName, data: T): Promise<string> {
    return (await this._db).add(storeName, data);
  }

  async update(storeName: StoreName, data: T): Promise<string> {
    return (await this._db).put(storeName, data);
  }

  async delete(storeName: StoreName, id: string): Promise<void> {
    return (await this._db).delete(storeName, id);
  }
}
