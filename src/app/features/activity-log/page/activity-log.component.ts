import {
  AfterContentInit,
  Component,
  ContentChild,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

import { ITaskBoard } from '@indexeddb/models/indexeddb.model';
import { TaskService } from '@indexeddb/services/task/task.service';
import { CustomFilterComponent } from 'src/app/core/components/custom-filter/custom-filter.component';
import {
  CROSS_MEMBERS,
  PRIORITIES,
  RELEASES,
  SPRINTS,
  SQUAD_MEMBERS,
  SquadKey,
} from '@constants/squad.constants';
import { SquadRequestsService } from '@indexeddb/services/squad-requests/squad-requests.service';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
})
export class ActivityLogComponent implements OnInit, AfterContentInit {
  @Input() flowType: string = '';

  @ContentChild(CustomFilterComponent) filter!: CustomFilterComponent;

  activities: ITaskBoard[] = [];
  activitiesBackup: ITaskBoard[] = [];

  selectedMember: string = 'Todos';
  selectedRelease: string = 'Todos';
  selectedSprint: string = 'Todos';
  selectedSquad: string = 'Todos';
  totalAllocatedHours = 0;
  totalSpentAllocatedHours = 0;
  activitySpentAllocatedHours = 0;

  newActivity = {
    id: '',
    title: '',
    description: '',
    status: '',
    sprint: '',
    release: '',
    allocatedHours: 0,
    employeeName: '',
    createdDate: new Date(),
    updatedDate: new Date(),
    squad: '',
    priority: '',
    tasks: [],
  };

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
    employeeName: new FormControl('', Validators.required),
    squad: new FormControl('', Validators.required),
    priority: new FormControl('', Validators.required),
    tasks: new FormArray([]),
  });

  members: string[] = [];
  sprints = SPRINTS;
  releases = RELEASES;
  squads = Object.keys(SQUAD_MEMBERS);
  priorities = PRIORITIES;

  squadForm: string = '';
  memberForm: string = '';

  get tasks(): FormArray {
    return this.activityForm.get('tasks') as FormArray;
  }

  constructor(
    private taskService: TaskService,
    private squadRequestsService: SquadRequestsService
  ) {}

  ngAfterContentInit(): void {
    if (this.filter) {
      this.filter.filterChangeEmmiter.subscribe((event) => {
        this.onFilterChange(event.value, event.event);
      });
      this.filter.cleanFilterEmitter.subscribe((isCleanFilter) => {
        if (isCleanFilter) {
          this.onCleanFilter();
        }
      });
    }
  }

  ngOnInit(): void {
    if (this.flowType === 'cross') {
      this.members = CROSS_MEMBERS;
    }
    this.getActivity();
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

  onCleanFilter() {
    this.selectedMember = 'Todos';
    this.selectedSprint = 'Todos';
    this.selectedRelease = 'Todos';
    this.selectedSquad = 'Todos';
    this.activities = [...this.activitiesBackup];
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editActivityId = null;
    this.activityForm.reset();
    this.tasks.clear();
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
      } else {
        const newActivity: ITaskBoard = {
          ...(this.activityForm.value as Required<ITaskBoard>),
          id: uuidv4(),
          createdDate: new Date(),
          updatedDate: new Date(),
        };

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

  updateActivity(activity: ITaskBoard) {
    this.isEditing = true;
    this.editActivityId = activity.id;

    this.activityForm.patchValue({
      title: activity.title,
      description: activity.description,
      status: activity.status,
      release: activity.release,
      sprint: activity.sprint,
      allocatedHours: activity.allocatedHours,
      employeeName: activity.employeeName,
      squad: activity.squad,
      priority: activity.priority,
    });

    this.squadForm = activity.squad
    this.getTotalAllocation(activity.employeeName)

    if (activity.tasks && activity.tasks.length) {
      this.tasks.clear();
      activity.tasks.forEach((task: any) => {
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

  getActivity() {
    this.taskService.getAllTasks().then((response) => {
      this.activities = response;
      this.activitiesBackup = response;
    });
  }

  getTotalAllocation(employeeName: string) {
    this.memberForm = employeeName
    if (this.squadForm !== '') {
      this.squadRequestsService
        .getRequestsBySquadAndEmployeeName(this.squadForm, this.memberForm)
        .then((response) => {
          if (response[0]?.allocatedHours) {
            console.log(response);
            console.log(response[0]);
            this.totalAllocatedHours = response[0].allocatedHours;
            this.totalSpentAllocatedHours = this.totalAllocatedHours - this.activitySpentAllocatedHours
            console.log(this.totalAllocatedHours);
          }else {
            this.totalAllocatedHours = 0
          }
        });
    }
  }

  onAllocatedHoursChange(hour: number){
    this.activitySpentAllocatedHours = hour

  }

  getActivityByemployeeName() {
    this.taskService
      .getTasksByEmployeeName(this.selectedMember)
      .then((response) => {
        this.activities = response;

        this.activitiesBackup = response;
      });
  }

  getActivityByRelease() {
    this.taskService
      .getTasksByRelease(this.selectedRelease)
      .then((response) => {
        this.activities = response;
      });
  }

  getActivityBySprint() {
    this.taskService.getTasksBySprint(this.selectedSprint).then((response) => {
      this.activities = response;
    });
  }

  onSquadChange(squad: string) {
    if (this.flowType === 'squad')
      this.members = SQUAD_MEMBERS[squad as SquadKey];

    this.squadForm = squad;
    this.getTotalAllocation(this.memberForm)
  }

  onEmployeeNameChange(employeeName: string) {
    this.getTotalAllocation(employeeName);
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
      this.members = SQUAD_MEMBERS[newValue as SquadKey];
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

      // Verifica se todas as condições são verdadeiras
      return conditions.every(Boolean);
    });
  }
}
