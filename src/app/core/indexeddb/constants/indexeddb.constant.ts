export const SquadRequestsDB = {
  nome: 'squadRequests',
  indices: ['id', 'crossName', 'squad'],
} as const;

export const CrossAllocationsDB = {
  nome: 'crossAllocations',
  indices: ['id', 'crossName', 'sprint'],
} as const;

export const TaskBoardDB = {
  nome: 'taskBoard',
  indices: ['id', 'sprint', 'crossName', 'squad', 'status', 'release'],
} as const;

type SquadRequestsDB = typeof SquadRequestsDB;
type CrossAllocationsDB = typeof CrossAllocationsDB;
type TaskBoardDB = typeof TaskBoardDB;

export const IndexedDB = {
  nome: 'CrossAllocationsDB',
  versao: 4,
  stores: {
    SquadRequestsDB,
    CrossAllocationsDB,
    TaskBoardDB,
  } as const,
} as const;
