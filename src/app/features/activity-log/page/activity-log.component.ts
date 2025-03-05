import {
  AfterContentInit,
  Component,
  ContentChild,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

import { ITaskBoard } from '@indexeddb/models/indexeddb.model';
import { TaskService } from '@indexeddb/services/task/task.service';
import { CustomFilterComponent } from '@components/custom-filter/custom-filter.component';
import {
  CROSS_MEMBERS,
  RELEASES,
  SPRINTS,
  SQUAD_MEMBERS,
  SquadKey,
} from '@constants/squad.constants';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
})
export class ActivityLogComponent implements OnInit, AfterContentInit {
  @Input() flow: string = '';

  @ContentChild(CustomFilterComponent) filter!: CustomFilterComponent;

  activities: ITaskBoard[] = [];
  activitiesBackup: ITaskBoard[] = [];

  selectedMember: string = 'Todos';
  selectedRelease: string = 'Todos';
  selectedSprint: string = 'Todos';
  selectedSquad: string = 'Todos';

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
    spentHours: new FormControl(0, [Validators.required, Validators.min(0)]),
    crossName: new FormControl('', Validators.required),
    squad: new FormControl('', Validators.required),
  });

  members = CROSS_MEMBERS;
  sprints = SPRINTS;
  releases = RELEASES;
  squads = Object.keys(SQUAD_MEMBERS);

  constructor(private taskService: TaskService) {}
  ngAfterContentInit(): void {
    if (this.filter) {
      this.filter.filterChangeEmmiter.subscribe((event) => {
        this.onFilterChange(event.value, event.event);
      });
    }
  }

  ngOnInit(): void {
    this.getActivity();
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
      spentHours: activity.spentHours,
      crossName: activity.crossName,
      squad: activity.squad,
    });

    this.openModal();
  }

  getActivity() {
    this.taskService.getAllTasks().then((response) => {
      this.activities = response;
      this.activitiesBackup = response;
    });
  }

  getActivityByCrossName() {
    this.taskService
      .getTasksByCrossName(this.selectedMember)
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

  onFilterChange2(newValue: string, type: string): void {
    if (type === 'member') {
      this.selectedMember = newValue;

      if (
        newValue === 'Todos' &&
        this.selectedSprint === 'Todos' &&
        this.selectedRelease === 'Todos'
      ) {
        this.getActivity();
      } else if (
        this.selectedSprint === 'Todos' &&
        this.selectedRelease === 'Todos'
      ) {
        this.activities = this.activitiesBackup.filter(
          (task) => task.crossName === newValue
        );
      } else if (this.selectedSprint === 'Todos') {
        this.activities = this.activitiesBackup.filter(
          (task) =>
            task.crossName === newValue && task.release === this.selectedRelease
        );
      } else {
        this.activities = this.activitiesBackup.filter(
          (task) =>
            task.sprint === newValue &&
            task.release === this.selectedRelease &&
            task.crossName === this.selectedMember
        );
      }
    } else if (type === 'release') {
      this.selectedRelease = newValue;

      if (
        newValue === 'Todos' &&
        this.selectedMember === 'Todos' &&
        this.selectedSprint === 'Todos'
      ) {
        this.getActivity();
      } else if (
        this.selectedMember === 'Todos' &&
        this.selectedSprint === 'Todos'
      ) {
        this.activities = this.activitiesBackup.filter(
          (task) => task.release === newValue
        );
      } else if (this.selectedMember === 'Todos') {
        this.activities = this.activitiesBackup.filter(
          (task) =>
            task.release === newValue && task.sprint === this.selectedSprint
        );
      } else {
        this.activities = this.activitiesBackup.filter(
          (task) =>
            task.release === newValue &&
            task.sprint === this.selectedSprint &&
            task.crossName === this.selectedMember
        );
      }
    } else {
      this.selectedSprint = newValue;

      if (
        newValue === 'Todos' &&
        this.selectedMember === 'Todos' &&
        this.selectedRelease === 'Todos'
      ) {
        this.getActivity();
      } else if (
        this.selectedMember === 'Todos' &&
        this.selectedRelease === 'Todos'
      ) {
        this.activities = this.activitiesBackup.filter(
          (task) => task.sprint === newValue
        );
      } else if (this.selectedMember === 'Todos') {
        this.activities = this.activitiesBackup.filter(
          (task) =>
            task.sprint === newValue && task.release === this.selectedRelease
        );
      } else {
        this.activities = this.activitiesBackup.filter(
          (task) =>
            task.sprint === newValue &&
            task.release === this.selectedRelease &&
            task.crossName === this.selectedMember
        );
      }
    }
  }
}
