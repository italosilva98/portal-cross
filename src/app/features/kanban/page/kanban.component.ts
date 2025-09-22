import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnInit,
} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { ITaskBoard } from '@indexeddb/models/indexeddb.model';
import { TaskService } from '@indexeddb/services/task/task.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Column, Task } from '../models/kanban.models';
import {
  CROSS_MEMBERS,
  PRIORITIES,
  RELEASES,
  SPRINTS,
  SQUAD_MEMBERS,
  SquadKey,
} from '@constants/squad.constants';
import { CustomFilterComponent } from 'src/app/core/components/custom-filter/custom-filter.component';
import { BaseFilterableComponent } from '@components/base/base-filterable.components';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss'],
})
export class KanbanComponent
  extends BaseFilterableComponent<ITaskBoard>
  implements OnInit, AfterContentInit
{
  @Input() flowType: string = '';
  @ContentChild(CustomFilterComponent) filter!: CustomFilterComponent;

  board: Column[] = [];

  members: string[] = [];
  sprints = SPRINTS;
  releases = RELEASES;
  squads = Object.keys(SQUAD_MEMBERS);
  prioridades = PRIORITIES;

  isModalOpen = false;
  isEditing = false;
  editActivityId: string | null = null;

  activityForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    status: new FormControl('', Validators.required),
    release: new FormControl('', Validators.required),
    sprint: new FormControl('', Validators.required),
    allocatedHours: new FormControl(1),
    spentHours: new FormControl(0),
    employeeName: new FormControl('', Validators.required),
    squad: new FormControl('', Validators.required),
    priority: new FormControl('', Validators.required),
    tasks: new FormArray([]),
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
    employeeName: '',
    createdDate: new Date(),
    updatedDate: new Date(),
    squad: '',
    priority: '',
    tasks: [],
  };

  get tasks(): FormArray {
    return this.activityForm.get('tasks') as FormArray;
  }

  constructor(private taskService: TaskService, private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    if (this.flowType === 'cross') {
      this.members = CROSS_MEMBERS;
    }
    this.loadData();
  }

  ngAfterContentInit(): void {
    if (this.filter) {
      this.filter.filterChangeEmmiter.subscribe((filter) => {
        this.onFilterChange(filter.value, filter.event);
      });

      this.filter.cleanFilterEmitter.subscribe((isCleanFilter) => {
        if (isCleanFilter) {
          this.onCleanFilter();
        }
      });
    }
  }

  override onCleanFilter() {
    super.onCleanFilter();
    this.createBoard(this.data);
  }

  onSquadChange(squad: string) {
    if (this.flowType === 'squad')
      this.members = SQUAD_MEMBERS[squad as SquadKey];
  }

  updateActivity(task: any) {
    this.isEditing = true;
    this.editActivityId = task.id;

    this.filterById(task.id);
    console.log("tasks- ", task)

    if (task.tasks && task.tasks.length) {
      this.tasks.clear();
      task.tasks.forEach((task: any) => {
        this.tasks.push(
          new FormGroup({
            title: new FormControl(task.title, Validators.required),
            description: new FormControl(task.description),
          })
        );
      });
    }

    this.openModal();
  }

  filterById(id: string) {
    // Procura a coluna que contém a tarefa com o ID desejado
    const column = this.data.find((col) => col.id === id);
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
        employeeName: column.employeeName,
        squad: column.squad,
        priority: column.priority,
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
    console.log("form: ", this.activityForm)
    if (this.activityForm.valid) {
      if (this.isEditing && this.editActivityId) {
        const index = this.data.findIndex((a) => a.id === this.editActivityId);

        this.data[index] = {
          ...(this.activityForm.value as Required<ITaskBoard>),
          id: this.editActivityId!,
          createdDate: this.data[index].createdDate,
          updatedDate: new Date(),
        };

        this.taskService.updateTask(this.data[index]);
        this.loadData();
      } else {
        const newActivity: ITaskBoard = {
          ...(this.activityForm.value as Required<ITaskBoard>),
          id: uuidv4(),
          createdDate: new Date(),
          updatedDate: new Date(),
        };

        this.taskService.addTask(newActivity).then(() => {
          this.loadData();
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
        this.loadData();
      });
      this.closeModal();
    }
  }

  loadData() {
    this.taskService.getAllTasks().then((response) => {
      this.data = response;
      this.dataBackup = response;
      console.log("data - ", this.data)
      this.createBoard(response);
    });
  }

  createBoard(tasks: ITaskBoard[]) {
    const ordemColunas = ['To Do', 'In Progress', 'Done'];

    this.board = this.transformToBoard(tasks);

    this.board = ordemColunas.map((name) => {
      // Busca a coluna existente pelo nome
      const existingColumn = this.board.find((column) => column.name === name);

      // Se existir, mantém as tasks, senão cria com tasks vazias
      return existingColumn || { name, tasks: [] };
    });
    this.connectedLists = this.board.map((column) => column.name);
  }

  addTask(): void {
    const taskGroup = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl(''),
    });
    this.tasks.push(taskGroup);
  }

  removeTask(index: number): void {
    this.tasks.removeAt(index);
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
        priority: task.priority,
        tasks: task.tasks
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

  override onFilterChange(newValue: string, type: string): void {
    super.onFilterChange(newValue, type);
    this.createBoard(this.data);
  }


  drop(event: CdkDragDrop<any[]>) {
    const taskId = event.item.data.id;
    const isSameContainer = event.previousContainer === event.container;
    const isMovingToDone = event.container.id === 'Done';
    const isMovingFromDone = event.previousContainer.id === 'Done';

    if (isSameContainer) {
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

      const taskIndex = this.data.findIndex((a) => a.id === taskId);
      const task = this.data[taskIndex];

      if (task) {
        this.activityForm.patchValue({
          ...task,
          status: event.container.id,
        });

        this.data[taskIndex] = {
          ...(this.activityForm.value as Required<ITaskBoard>),
          id: taskId,
          createdDate: task.createdDate,
          updatedDate: new Date(),
        };

        this.taskService.updateTask(this.data[taskIndex]);
        this.activityForm.reset();
      }
    }
  }
}
