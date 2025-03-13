import {
  AfterContentInit,
  Component,
  ContentChild,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

import { ISquadRequests, ITaskBoard } from '@indexeddb/models/indexeddb.model';
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
import { BaseFilterableComponent } from '@components/base/base-filterable.components';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
})
export class ActivityLogComponent
  extends BaseFilterableComponent<ITaskBoard>
  implements OnInit, AfterContentInit
{
  @Input() flowType: string = '';

  @ContentChild(CustomFilterComponent) filter!: CustomFilterComponent;

  totalAllocatedHours = 0;
  totalSpentAllocatedHours = 0;
  activitySpentAllocatedHours = 0;
  activitySprint = '';
  activityRelease = '';

  squadRequest: ISquadRequests[] = [];

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
  allHours = 0;

  squadForm: string = '';
  memberForm: string = '';

  get tasks(): FormArray {
    return this.activityForm.get('tasks') as FormArray;
  }

  constructor(
    private taskService: TaskService,
    private squadRequestsService: SquadRequestsService
  ) {
    super();
  }

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

  //ok
  ngOnInit(): void {
    if (this.flowType === 'cross') {
      this.members = CROSS_MEMBERS;
    }
    this.loadData();
    this.getSquadRequests();
  }

  //ok
  loadData() {
    this.taskService.getAllTasks().then((response) => {
      this.data = response;
      this.dataBackup = response;
    });
  }

  //ok
  getSquadRequests() {
    this.squadRequestsService.getAllSquadRequests().then((response) => {
      this.squadRequest = response;
    });
  }

  //ok
  openModal() {
    this.isModalOpen = true;
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
        const index = this.data.findIndex((a) => a.id === this.editActivityId);

        this.data[index] = {
          ...(this.activityForm.value as Required<ITaskBoard>),
          id: this.editActivityId!,
          createdDate: this.data[index].createdDate,
          updatedDate: new Date(),
        };

        this.taskService.updateTask(this.data[index]);
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
      const allocatedHours = this.activityForm.get('allocatedHours')?.value;
      if (allocatedHours != null) {
        if (this.squadRequest[0].allocatedHoursUsed)
          this.squadRequest[0].allocatedHoursUsed += allocatedHours;
        else {
          this.squadRequest[0].allocatedHoursUsed = allocatedHours;
        }
      }

      this.squadForm = 'activity.squad';
      this.activitySprint = 'activity.sprint';
      this.activityRelease = 'activity.release';
      this.squadForm = '';
      this.squadRequestsService.updateSquadRequests(this.squadRequest[0]);
      this.squadRequest = [];
      this.totalAllocatedHours = 0;
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

    this.squadForm = activity.squad;
    this.activitySprint = activity.sprint;
    this.activityRelease = activity.release;

    this.getTotalAllocation(activity.employeeName, 'updateActivity');

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

  getTotalAllocation(employeeName: string, type: string) {
    this.memberForm = employeeName;
    if (
      this.squadForm !== '' &&
      this.activityRelease !== '' &&
      this.activitySprint !== ''
    ) {
      let request = this.squadRequest.filter(
        (request) =>
          request.squad === this.squadForm &&
          request.employeeName === this.memberForm &&
          request.release === this.activityRelease &&
          request.sprint === this.activitySprint
      );

      if (!request[0]?.allocatedHours) request[0].allocatedHours = 0;
      this.totalAllocatedHours = request[0].allocatedHours;

      this.totalSpentAllocatedHours =
        request[0].allocatedHours - request[0].allocatedHoursUsed;
    }
  }

  onAllocatedHoursChange(hour: number) {
    this.activitySpentAllocatedHours = hour;
  }

  onReleaseChange(release: string) {
    this.activityRelease = release;
    this.getTotalAllocation(this.memberForm, 'onReleaseChange');
  }

  onSprintChange(sprint: string) {
    this.activitySprint = sprint;
    this.getTotalAllocation(this.memberForm, 'onSprintChange');
  }

  getActivityByemployeeName() {
    this.taskService
      .getTasksByEmployeeName(this.selectedMember)
      .then((response) => {
        this.data = response;

        this.dataBackup = response;
      });
  }

  getActivityByRelease() {
    this.taskService
      .getTasksByRelease(this.selectedRelease)
      .then((response) => {
        this.data = response;
      });
  }

  getActivityBySprint() {
    this.taskService.getTasksBySprint(this.selectedSprint).then((response) => {
      this.data = response;
    });
  }

  onSquadChange(squad: string) {
    if (this.flowType === 'squad')
      this.members = SQUAD_MEMBERS[squad as SquadKey];

    this.squadForm = squad;
    this.getTotalAllocation(this.memberForm, 'onSquadChange');
  }

  onEmployeeNameChange(employeeName: string) {
    this.getTotalAllocation(employeeName, 'onEmployeeNameChange');
  }
}
