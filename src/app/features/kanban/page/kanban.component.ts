import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { ITaskBoard } from '@indexeddb/models/indexeddb.model';
import { TaskService } from '@indexeddb/services/task/task.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Column, Task } from '../models/kanban.models';
import {
  CROSS_MEMBERS,
  PRIORITIES,
  RELEASES,
  SPRINTS,
  SQUAD_MEMBERS,
} from '@constants/squad.constants';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss'],
})
export class KanbanComponent implements OnInit {
  board: Column[] = [];
  activities: ITaskBoard[] = [];
  activitiesBackup: ITaskBoard[] = [];

  membros = CROSS_MEMBERS;
  sprints = SPRINTS;
  releases = RELEASES;
  squads = Object.keys(SQUAD_MEMBERS);
  prioridades = PRIORITIES;
  selectedMember: string = 'Todos';
  selectedRelease: string = 'Todos';
  selectedSprint: string = 'Todos';
  selectedSquad: string = 'Todos';
  selectedPriority: string = 'Todos';

  isModalOpen = false;
  isEditing = false;
  editActivityId: string | null = null;

  activityForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    status: new FormControl('', Validators.required),
    release: new FormControl('', Validators.required),
    sprint: new FormControl('', Validators.required),
    allocatedHours: new FormControl(1, [
      Validators.required,
      Validators.min(1),
    ]),
    spentHours: new FormControl(0, [Validators.required, Validators.min(0)]),
    crossName: new FormControl('', Validators.required),
    squad: new FormControl('', Validators.required),
    prioridade: new FormControl('', Validators.required),
  });
  connectedLists: string[] = [];

  newActivity = {
    id: '',
    title: '',
    description: '',
    status: '',
    sprint: '',
    release: '',
    allocatedHours: 0,
    spentHours: 0,
    crossName: '',
    createdDate: new Date(),
    updatedDate: new Date(),
    squad: '',
    prioridade: '',
  };

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.getActivity();
  }

  updateActivity(task: any) {
    console.log(task);
    this.isEditing = true;
    this.editActivityId = task.id;

    this.filterById(task.id);

    this.openModal();
  }

  filterById(id: string) {
    // Procura a coluna que contém a tarefa com o ID desejado
    const column = this.activities.find((col) => col.id === id);
    console.log('colum:', column);
    // Se encontrou a coluna, filtra as tasks e retorna o objeto completo
    if (column) {
      this.activityForm.patchValue({
        title: column.title,
        description: column.description,
        status: column.status,
        release: column.release,
        sprint: column.sprint,
        allocatedHours: column.allocatedHours,
        spentHours: column.spentHours,
        crossName: column.crossName,
        squad: column.squad,
        prioridade: column.prioridade,
      });
    }
  }
  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editActivityId = null;
    this.activityForm.reset();
  }

  onSubmit() {
    if (this.activityForm.valid) {
      if (this.isEditing && this.editActivityId) {
        const index = this.activities.findIndex(
          (a) => a.id === this.editActivityId
        );

        this.activities[index] = {
          ...(this.activityForm.value as Required<ITaskBoard>),
          id: this.editActivityId!,
          createdDate: this.activities[index].createdDate,
          updatedDate: new Date(),
        };

        this.taskService.updateTask(this.activities[index]);
        console.log('activities: ', this.activities);
        this.getActivity();
      } else {
        const newActivity: ITaskBoard = {
          ...(this.activityForm.value as Required<ITaskBoard>),
          id: uuidv4(),
          createdDate: new Date(),
          updatedDate: new Date(),
        };

        console.log('newActivity: ', newActivity);

        this.taskService.addTask(newActivity).then(() => {
          this.getActivity();
        });
      }
      this.closeModal();
    }
  }

  deleteActivity(id: string) {
    const confirmation = confirm(
      'Tem certeza que deseja excluir esta atividade?'
    );
    if (confirmation) {
      this.taskService.deleteTask(id).then(() => {
        this.getActivity();
      });
      this.closeModal();
    }
  }

  getActivity() {
    this.taskService.getAllTasks().then((response) => {
      this.activities = response;
      this.activitiesBackup = response;

      this.createBoard(response);
    });
  }

  createBoard(tasks: ITaskBoard[]) {
    const ordemColunas = ['To Do', 'In Progress', 'Review', 'Done'];

    this.board = this.transformToBoard(tasks);

    this.board = ordemColunas.map((name) => {
      // Busca a coluna existente pelo nome
      const existingColumn = this.board.find((column) => column.name === name);

      // Se existir, mantém as tasks, senão cria com tasks vazias
      return existingColumn || { name, tasks: [] };
    });
    this.connectedLists = this.board.map((column) => column.name);
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
        prioridade: task.prioridade,
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

  getPriorityClass(prioridade: string): string {
    switch (prioridade) {
      case 'Baixa':
        return 'task-tag-baixa';
      case 'Média':
        return 'task-tag-media';
      case 'Alta':
        return 'task-tag-alta';
      default:
        return '';
    }
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
    } else if (type === 'priority') {
      this.selectedPriority = newValue;
    }

    // Se todos os filtros estão em "Todos", mostra todas as atividades
    if (
      this.selectedMember === 'Todos' &&
      this.selectedSprint === 'Todos' &&
      this.selectedRelease === 'Todos' &&
      this.selectedSquad === 'Todos' &&
      this.selectedPriority === 'Todos'
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
      if (this.selectedPriority !== 'Todos') {
        conditions.push(task.prioridade === this.selectedPriority);
      }

      // Verifica se todas as condições são verdadeiras
      return conditions.every(Boolean);
    });

    this.createBoard(this.activities);
  }

  drop(event: CdkDragDrop<any[]>) {
    const taskId = event.item.data.id;
    const isSameContainer = event.previousContainer === event.container;
    const isMovingToDone = event.container.id === 'Done';
    const isMovingFromDone = event.previousContainer.id === 'Done';

    if (isSameContainer) {
      console.log('Mesma coluna:', event.container.id);
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      return;
    }

    const shouldConfirm = isMovingToDone
      ? confirm('Tem certeza que deseja encerrar a atividade?')
      : true;

    if (shouldConfirm && !isMovingFromDone) {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const taskIndex = this.activities.findIndex((a) => a.id === taskId);
      const task = this.activities[taskIndex];

      if (task) {
        this.activityForm.patchValue({
          ...task,
          status: event.container.id,
        });

        this.activities[taskIndex] = {
          ...(this.activityForm.value as Required<ITaskBoard>),
          id: taskId,
          createdDate: task.createdDate,
          updatedDate: new Date(),
        };

        this.taskService.updateTask(this.activities[taskIndex]);
        this.activityForm.reset();
      }
    }
  }
}
