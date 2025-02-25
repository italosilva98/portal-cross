import { DBSchema } from 'idb';

export interface ISquadRequests {
  id: string;
  crossName: string;
  sprint: string;
  release: string;
  squad: string;
  allocatedHours: number;
}

export interface ICrossAllocations {
  id: string;
  crossName: string;
  availableHours: number;
  sprint: string;
  release: string;
}

export interface ITaskBoard {
  id: string;
  title: string;
  description: string;
  status: string;
  sprint: string;
  release: string;
  allocatedHours: number;
  spentHours: number;
  crossName: string;
  createdDate: Date;
  updatedDate: Date;
  squad: string;
}

export interface AppDB extends DBSchema {
  squadRequests: {
    key: string;
    value: ISquadRequests;
    indexes: Record<`by-${string}`, string>;
  };
  taskBoard: {
    key: string;
    value: ITaskBoard;
    indexes: Record<`by-${string}`, string>;
  };
  crossAllocations: {
    key: string;
    value: ICrossAllocations;
    indexes: Record<`by-${string}`, string>;
  };
}
