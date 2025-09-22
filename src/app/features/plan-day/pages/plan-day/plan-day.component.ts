import { Component, ContentChild, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskService } from '@indexeddb/services/task/task.service';
import { CustomFilterComponent } from 'src/app/core/components/custom-filter/custom-filter.component';
import { BaseFilterableComponent } from '@components/base/base-filterable.components';
import { ITaskBoard } from '@indexeddb/models/indexeddb.model';
import {
  PRIORITIES,
  RELEASES,
  SPRINTS,
  SQUAD_MEMBERS,
} from '@constants/squad.constants';

interface Task {
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  order?: number;
}

@Component({
  selector: 'app-plan-day',
  templateUrl: './plan-day.component.html',
  styleUrls: ['./plan-day.component.scss'],
})
export class PlanDayComponent
  extends BaseFilterableComponent<ITaskBoard>
  implements OnInit
{
  @ContentChild(CustomFilterComponent) filter!: CustomFilterComponent;

  tasks: Task[] = [
    { title: 'Azure Authentication', description: 'Torre', priority: 'High' },
    { title: 'MFE List and Detail', priority: 'High' },
    {
      title: 'NSMC Analysis',
      description: 'Analyze connection with native journeys and output process',
      priority: 'High',
    },
    { title: 'Malote Pilot', description: 'Follow pilot', priority: 'Low' },
  ];

  members: string[] = [];
  sprints = SPRINTS;
  releases = RELEASES;
  squads = Object.keys(SQUAD_MEMBERS);
  prioridades = PRIORITIES;
  dataPlan: any;

  constructor(private taskService: TaskService) {
    super();
  }

  ngOnInit(): void {
    this.loadData();
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
  override onCleanFilter() {
    super.onCleanFilter();
    this.createTaks(this.data);
  }

  override onFilterChange(newValue: string, type: string): void {
    super.onFilterChange(newValue, type);
    this.createTaks(this.data);
  }

  drop(event: CdkDragDrop<Task[]>) {
    moveItemInArray(this.dataPlan, event.previousIndex, event.currentIndex);
    this.updateTaskOrder(); // atualiza os campos "order"
  }

  updateTaskOrder() {
    this.dataPlan.forEach((task: Task, index: number) => {
      task.order = index;
    });
  }

  saveDayPlan() {
    console.log('Day plan saved:', this.tasks);
    // Optionally send to backend
  }

  onSortChange() {
    if (this.sortMode === 'priority-desc') {
      this.dataPlan.sort(
        (a: Task, b: Task) =>
          this.priorityWeight(a.priority) - this.priorityWeight(b.priority)
      );
    } else if (this.sortMode === 'priority-asc') {
      this.dataPlan.sort(
        (a: Task, b: Task) =>
          this.priorityWeight(b.priority) - this.priorityWeight(a.priority)
      );
    }
    this.updateTaskOrder(); // sempre atualiza os campos `order`
  }
  priorityWeight(priority: string): number {
    const map = { High: 1, Medium: 2, Low: 3 };
    return map[priority as keyof typeof map] || 4;
  }

  sortMode: 'manual' | 'priority-asc' | 'priority-desc' = 'manual';

  loadData() {
    // this.taskService.getAllTasks().then((response) => {
    //   this.dataPlan = response.filter((data) => data.status !== 'Done');
    //   console.log('this.dataPlan:', this.dataPlan);
    // });

    this.taskService.getAllTasks().then((response) => {
      this.data = response;
      this.dataBackup = response;
      this.createTaks(response);
    });
  }

  createTaks(response: ITaskBoard[]) {
    console.log('response: ', response);
    this.dataPlan = response
      .filter((task) => task.status !== 'Done')
      .filter((value) => value.status !== 'To Do')
      .map((task) => (task.tasks))
    console.log("tasks: ", this.dataPlan  )
    this.dataPlan.sort(
      (a: { order: number }, b: { order: number }) => a.order - b.order
    );
  }
}
