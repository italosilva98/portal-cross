import { DBSchema } from 'idb';

export interface ISquadRequests {
  id: string;
  employeeName: string;
  sprint: string;
  release: string;
  squad: string;
  allocatedHours: number;
  allocatedHoursUsed: number;
  description: string
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
  employeeName: string;
  createdDate: Date;
  updatedDate: Date;
  squad: string;
  priority: string;
  tasks: [];
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
}
