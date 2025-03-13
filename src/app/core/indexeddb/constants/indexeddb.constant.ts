export const SquadRequestsDB = {
  nome: 'squadRequests',
  indices: ['id', 'employeeName', 'squad'],
} as const;

export const TaskBoardDB = {
  nome: 'taskBoard',
  indices: ['id', 'sprint', 'employeeName', 'squad', 'status', 'release'],
} as const;

type SquadRequestsDB = typeof SquadRequestsDB;
type TaskBoardDB = typeof TaskBoardDB;

export const IndexedDB = {
  nome: 'CrossAllocationsDB',
  versao: 4,
  stores: {
    SquadRequestsDB,
    TaskBoardDB,
  } as const,
} as const;
