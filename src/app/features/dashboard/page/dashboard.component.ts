import {
  AfterContentInit,
  Component,
  ContentChild,
  Input,
} from '@angular/core';
import Chart from 'chart.js/auto';
import { ITaskBoard } from '@indexeddb/models/indexeddb.model';
import { TaskService } from '@indexeddb/services/task/task.service';
import { CROSS_MEMBERS, SQUAD_MEMBERS } from '@constants/squad.constants';
import { CustomFilterComponent } from 'src/app/core/components/custom-filter/custom-filter.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements AfterContentInit {
  @Input() flowType: string = '';
  @ContentChild(CustomFilterComponent) filter!: CustomFilterComponent;

  activities: ITaskBoard[] = [];
  activitiesBackup: ITaskBoard[] = [];
  reportData: any[] = [];

  reports: any;

  squadMembers = SQUAD_MEMBERS;

  reportTasks: any[] = [];
  selectedMember: string = 'Todos';
  selectedRelease: string = 'Todos';
  selectedSprint: string = 'Todos';
  selectedSquad: string = 'Todos';
  totalReport: {
    allocatedHours: number;
    spentHours: number;
    completedTasks: number;
    pendingTasks: number;
  } = {
    allocatedHours: 0,
    spentHours: 0,
    completedTasks: 0,
    pendingTasks: 0,
  };

  members: string[] = [];
  private hoursBySquadChart: Chart | null = null;
  private hoursSpentBySquadChart: Chart | null = null;
  private taskStatusChart: Chart | null = null;

  constructor(private taskService: TaskService) {}

  async ngOnInit() {
    // this.eventBusService.getEvent<Filter>('filter').subscribe((filter) => {
    //   console.log("entrou: ", filter)
    //   if (filter) {
    //     this.selectedRelease = filter.release;
    //     this.selectedSprint = filter.sprint;
    //     this.selectedSquad = filter.squad;
    //   }
    // });
    if (this.flowType === 'cross') {
      this.members = CROSS_MEMBERS;
    }
    this.getActivity();



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

  onCleanFilter() {
    this.selectedMember = 'Todos';
    this.selectedSprint = 'Todos';
    this.selectedRelease = 'Todos';
    this.selectedSquad = 'Todos';
    this.selectedSquad = 'Todos';
    this.getActivity();
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

    console.log('act: ', this.activities);
    this.createDashBoards(this.activities);
  }

  onFilterChange2(): void {
    // Atualiza os filtros com base no tipo

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

    console.log('act: ', this.activities);
    this.createDashBoards(this.activities);
  }

  transformToReportData(activities: any[]): any[] {
    const reportData = activities.reduce((acc, activity) => {
      const squad = activity.squad;
      const existingSquad = acc.find((item: any) => item === squad);

      if (existingSquad) {
        existingSquad.allocatedHours += activity.allocatedHours;
        existingSquad.spentHours += activity.spentHours;
      } else {
        acc.push({
          squad: squad,
          allocatedHours: activity.allocatedHours,
          spentHours: activity.spentHours,
        });
      }

      return acc;
    }, []);

    console.log('Transformed Report Data:', reportData);
    return reportData;
  }

  transformToReportTask(activities: any[]): any[] {
    const statusReport = activities.reduce((acc, activity) => {
      const status = activity.status;
      const existingStatus = acc.find((item: any) => item.label === status);

      if (existingStatus) {
        existingStatus.task += 1;
      } else {
        acc.push({
          label: status,
          task: 1,
        });
      }

      return acc;
    }, []);

    console.log('Transformed Status Report Data:', statusReport);
    return statusReport;
  }

  transformToTotalReport(activities: any[]): any {
    const totalReport = activities.reduce(
      (acc, activity) => {
        acc.allocatedHours += activity.allocatedHours;
        acc.spentHours += activity.spentHours;

        if (activity.status === 'Done') {
          acc.completedTasks += 1;
        } else {
          acc.pendingTasks += 1;
        }

        return acc;
      },
      {
        allocatedHours: 0,
        spentHours: 0,
        completedTasks: 0,
        pendingTasks: 0,
      }
    );

    console.log('Total Report:', totalReport);
    return totalReport;
  }

  getActivity() {
    this.taskService.getAllTasks().then((response) => {
      this.activitiesBackup = response;
      this.createDashBoards(response);
    });
  }

  createDashBoards(response: any) {
    this.reportData = this.transformToReportData(response);
    this.reportTasks = this.transformToReportTask(response);
    this.totalReport = this.transformToTotalReport(response);
    this.createCharts();
  }

  createCharts() {
    const defaultColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

    const generateColors = (numColors: number) => {
      const colors = [...defaultColors];
      while (colors.length < numColors) {
        const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
        if (!colors.includes(color)) {
          colors.push(color);
        }
      }
      return colors.slice(0, numColors);
    };

    if (this.hoursBySquadChart) {
      this.hoursBySquadChart.data.labels = this.reportData.map(
        (data) => data.squad
      );
      this.hoursBySquadChart.data.datasets[0].data = this.reportData.map(
        (data) => data.allocatedHours
      );
      this.hoursBySquadChart.update();
    } else {
      this.hoursBySquadChart = new Chart('hoursBySquadChart', {
        type: 'pie',
        data: {
          labels: this.reportData.map((data) => data.squad),
          datasets: [
            {
              data: this.reportData.map((data) => data.allocatedHours),
              backgroundColor: generateColors(this.reportData.length),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
        },
      });
    }
    if (this.hoursSpentBySquadChart) {
      this.hoursSpentBySquadChart.data.labels = this.reportData.map(
        (data) => data.squad
      );
      this.hoursSpentBySquadChart.data.datasets[0].data = this.reportData.map(
        (data) => data.allocatedHours
      );
      this.hoursSpentBySquadChart.update();
    } else {
      this.hoursSpentBySquadChart = new Chart('hoursSpentBySquadChart', {
        type: 'pie',
        data: {
          labels: this.reportData.map((data) => data.squad),
          datasets: [
            {
              data: this.reportData.map((data) => data.spentHours),
              backgroundColor: generateColors(this.reportData.length),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
        },
      });
    }
    if (this.taskStatusChart) {
      this.taskStatusChart.data.labels = this.reportData.map(
        (data) => data.squad
      );
      this.taskStatusChart.data.datasets[0].data = this.reportData.map(
        (data) => data.allocatedHours
      );
      this.taskStatusChart.update();
    } else {
      this.taskStatusChart = new Chart('taskStatusChart', {
        type: 'bar',
        data: {
          labels: this.reportTasks.map((data) => data.label),
          datasets: [
            {
              label: 'Tarefas',
              data: this.reportTasks.map((data) => data.task),
              backgroundColor: generateColors(this.reportTasks.length),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }
  }
}
