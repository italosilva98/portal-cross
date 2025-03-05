export type SquadKey =
  | 'Suprimentos'
  | 'Tron'
  | 'Clix'
  | 'Alvo'
  | 'Entregas'
  | 'Buzz';

export const SQUAD_MEMBERS: Record<SquadKey, string[]> = {
  Suprimentos: ['Victor Abla', 'Victor Ramos', 'Thales Neves'],
  Tron: ['Vinicius', 'Aguirres', 'Carlos'],
  Clix: ['nome 2', 'nome 2', 'nome 3'],
  Alvo: ['nome 2', 'nome 2', 'nome 3'],
  Entregas: ['nome 2', 'nome 2', 'nome 3'],
  Buzz: ['nome 2', 'nome 2', 'nome 3'],
};

export const CROSS_MEMBERS = [
  'Italo Silvestre',
  'Luiz Arquiteto',
  'Gabriel UX',
];
export const SPRINTS = ['S1', 'S2', 'S3', 'S4'];
export const RELEASES = ['R1', 'R2', 'R3', 'R4'];
export const PRIORITIES = ['Baixa', 'Média', 'Alta'];
