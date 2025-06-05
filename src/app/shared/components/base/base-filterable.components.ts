import { ChangeDetectorRef, inject, Injectable } from '@angular/core';

export interface TaskFilter {
  employeeName: string;
  release: string;
  sprint: string;
  squad: string;
}

@Injectable()
export abstract class BaseFilterableComponent<T extends TaskFilter> {
  // Dados que serão exibidos e sua cópia para reinicializar os filtros
  data: T[] = [];
  dataBackup: T[] = [];

  // Propriedades de filtro padrão
  selectedMember: string = 'Todos';
  selectedSprint: string = 'Todos';
  selectedRelease: string = 'Todos';
  selectedSquad: string = 'Todos';
  selectedPriority: string = 'Todos';

  readonly cdr = inject(ChangeDetectorRef)

  /**
   * Método abstrato para carregar os dados iniciais.
   * Cada componente filho deverá implementá-lo.
   */
  protected abstract loadData(): void;

  /**
   * Reseta os filtros para o valor padrão e restaura os dados originais.
   */
  onCleanFilter(): void {
    this.selectedMember = 'Todos';
    this.selectedSprint = 'Todos';
    this.selectedRelease = 'Todos';
    this.selectedSquad = 'Todos';
    this.selectedPriority = 'Todos';
    this.data = [...this.dataBackup];
  }

  /**
   * Atualiza as propriedades de filtro com base no tipo e valor e aplica a filtragem.
   * Se todos os filtros estiverem em "Todos", chama o método loadData() para recarregar os dados.
   */
  onFilterChange(newValue: string, type: string): void {
    switch (type) {
      case 'member':
        this.selectedMember = newValue;
        break;
      case 'release':
        this.selectedRelease = newValue;
        break;
      case 'sprint':
        this.selectedSprint = newValue;
        break;
      case 'squad':
        this.selectedSquad = newValue;
        break;
      case 'priority':
        this.selectedPriority = newValue;
        break;
      default:
        break;
    }

    if (
      this.selectedMember === 'Todos' &&
      this.selectedSprint === 'Todos' &&
      this.selectedRelease === 'Todos' &&
      this.selectedSquad === 'Todos' &&
      this.selectedPriority === 'Todos'
    ) {
      this.loadData();
      return;
    }
    this.data = this.applyFilters(this.dataBackup);

    this.cdr.markForCheck()

  }

  /**
   * Aplica os filtros ao array de dados e retorna o resultado filtrado.
   */
  applyFilters(data: T[]): T[] {
    return data.filter((task: T) => {
      const conditions: boolean[] = [];

      if (this.selectedMember !== 'Todos') {
        conditions.push(task.employeeName === this.selectedMember);
      }
      if (this.selectedRelease !== 'Todos') {
        conditions.push(task.release === this.selectedRelease);
      }
      if (this.selectedSprint !== 'Todos') {
        conditions.push(task.sprint === this.selectedSprint);
      }
      if (this.selectedSquad !== 'Todos') {
        conditions.push(task.squad === this.selectedSquad);
      }

      return conditions.every(Boolean);
    });
  }
}
