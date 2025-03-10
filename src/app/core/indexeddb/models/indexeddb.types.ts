import { ISquadRequests, ITaskBoard } from './indexeddb.model';

// Store Names
export type StoreName = 'squadRequests' | 'taskBoard';

// Index Names
export type IndexName = `by-${string}`;

// Entidades Aceitas para o Genérico T
export type EntityType = ISquadRequests | ITaskBoard;
