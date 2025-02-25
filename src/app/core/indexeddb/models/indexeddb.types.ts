import { ISquadRequests, ICrossAllocations, ITaskBoard } from './indexeddb.model';

// Store Names
export type StoreName = 'squadRequests' | 'crossAllocations' | 'taskBoard';

// Index Names
export type IndexName = `by-${string}`;

// Entidades Aceitas para o Genérico T
export type EntityType = ISquadRequests | ICrossAllocations | ITaskBoard;
