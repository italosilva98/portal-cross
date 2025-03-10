import { Directive, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RELEASES, SPRINTS, SQUAD_MEMBERS } from '@constants/squad.constants';
import { ITaskBoard } from '@indexeddb/models/indexeddb.model';
import { TaskService } from '@indexeddb/services/task/task.service';

@Directive()
export abstract class BaseActivityComponent implements OnInit {
  activities: ITaskBoard[] = [];
  activitiesBackup: ITaskBoard[] = [];

  members: string[] = [];
  sprints = SPRINTS;
  releases = RELEASES;
  squads = Object.keys(SQUAD_MEMBERS);
  selectedMember: string = 'Todos';
  selectedRelease: string = 'Todos';
  selectedSprint: string = 'Todos';
  selectedSquad: string = 'Todos';

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
    prioridade: new FormControl(''),
  });

  constructor(protected taskService: TaskService) {}

  ngOnInit(): void {
    this.getActivity();
  }

  getActivity() {
    this.taskService.getAllTasks().then((response) => {
      this.activities = response;
      this.activitiesBackup = response;
    });
  }

  onFilterChange(newValue: string, type: string): void {
    // Atualiza os filtros
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

    // Filtragem composta
    this.activities = this.activitiesBackup.filter((task) => {
      const conditions = [];
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
      return conditions.every(Boolean);
    });
  }

  onCleanFilter() {
    this.activities = [...this.activitiesBackup];
  }
}
