import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { ITaskBoard } from 'src/app/core/indexeddb/models/indexeddb.model';
import { TaskService } from 'src/app/core/indexeddb/services/task/task.service';
import { Column, Task } from '../models/kanban.models';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss'],
})
export class KanbanComponent implements OnInit {
  columns: Column[] = [
    {
      name: 'Backlog',
      tasks: [
        {
          id: uuidv4(),
          title: 'Tarefa 1',
          description: 'Descrição da Tarefa 1',
        },
        {
          id: uuidv4(),
          title: 'Tarefa 2',
          description: 'Descrição da Tarefa 2',
        },
      ],
    },
    {
      name: 'Em Progresso',
      tasks: [
        {
          id: uuidv4(),
          title: 'Tarefa 3',
          description: 'Descrição da Tarefa 3',
        },
      ],
    },
    {
      name: 'Em Validação',
      tasks: [
        {
          id: uuidv4(),
          title: 'Tarefa 3',
          description: 'Descrição da Tarefa 3',
        },
      ],
    },
    {
      name: 'Concluído',
      tasks: [
        {
          id: uuidv4(),
          title: 'Tarefa 4',
          description: 'Descrição da Tarefa 4',
        },
      ],
    },
  ];

  board: Column[] = [];
  activities: ITaskBoard[] = [];
  activitiesBackup: ITaskBoard[] = [];

  membros = ['Italo Silvestre', 'Luiz Arquiteto', 'Gabriel UX'];
  sprints = ['S1', 'S2', 'S3', 'S4'];
  releases = ['R1', 'R2', 'R3', 'R4'];
  squads = ['Clix', 'Tron', 'Alvo', 'Entregas', 'Torre', 'Suprimentos'];
  selectedMember: string = 'Todos';
  selectedRelease: string = 'Todos';
  selectedSprint: string = 'Todos';
  selectedSquad: string = 'Todos';

  connectedLists: string[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.getActivity();

    this.connectedLists = this.columns.map((column) => column.name);
  }

  getActivity() {
    this.taskService.getAllTasks().then((response) => {
      this.activities = response;
      console.log('act', this.activities);
      this.activitiesBackup = response;
      this.board = this.transformToBoard(response);
      console.log('board: ', this.board);
    });
  }

  transformToBoard(tasks: ITaskBoard[]): Column[] {
    // Agrupa as tarefas por status
    const groupedTasks = tasks.reduce((groups, task) => {
      const status = task.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push({
        id: task.id,
        title: task.title,
        description: task.description,
      });
      return groups;
    }, {} as Record<string, Task[]>);

    // Transforma os grupos em colunas
    const columns: Column[] = Object.keys(groupedTasks).map((status) => ({
      name: status,
      tasks: groupedTasks[status],
    }));

    // Retorna um objeto do tipo Board
    return columns;
  }

  onFilterChange(newValue: string, type: string): void {
    // Atualiza os filtros com base no tipo
    if (type === 'member') {
      this.selectedMember = newValue;
    } else if (type === 'release') {
      this.selectedRelease = newValue;
    } else if (type === 'sprint') {
      this.selectedSprint = newValue;
    } else if (type === 'squad') {
      this.selectedSquad = newValue;
    }

    // Se todos os filtros estão em "Todos", mostra todas as atividades
    if (
      this.selectedMember === 'Todos' &&
      this.selectedSprint === 'Todos' &&
      this.selectedRelease === 'Todos' &&
      this.selectedSquad === 'Todos'
    ) {
      this.getActivity();
      return;
    }

    // Filtragem composta com base nos filtros selecionados
    this.activities = this.activitiesBackup.filter((task) => {
      const conditions = [];

      // Adiciona condições dinamicamente
      if (this.selectedMember !== 'Todos') {
        conditions.push(task.crossName === this.selectedMember);
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

      // Verifica se todas as condições são verdadeiras
      return conditions.every(Boolean);
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    console.log('Drop Event:', event);
    if (event.previousContainer === event.container) {
      // Reordenar na mesma coluna
      console.log('Mesma coluna:', event.container.id);
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Mover para outra coluna
      console.log(
        'Coluna diferente:',
        event.previousContainer.id,
        '->',
        event.container.id
      );
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
