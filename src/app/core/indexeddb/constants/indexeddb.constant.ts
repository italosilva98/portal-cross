export const SquadRequestsDB = {
  nome: 'squadRequests',
  indices: ['id', 'crossName', 'squad'],
} as const;

export const TaskBoardDB = {
  nome: 'taskBoard',
  indices: ['id', 'sprint', 'crossName', 'squad', 'status', 'release'],
} as const;

type SquadRequestsDB = typeof SquadRequestsDB;
type TaskBoardDB = typeof TaskBoardDB;

export const IndexedDB = {
  nome: 'CrossAllocationsDB',
  versao: 7,
  stores: {
    SquadRequestsDB,
    TaskBoardDB,
  } as const,
} as const;
