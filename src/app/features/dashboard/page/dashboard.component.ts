import { Component, Input } from '@angular/core';
import Chart from 'chart.js/auto';
import { ITaskBoard } from '@indexeddb/models/indexeddb.model';
import { TaskService } from '@indexeddb/services/task/task.service';
import { SQUAD_MEMBERS } from '@constants/squad.constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  @Input() flow: string = '';

  activities: ITaskBoard[] = [];
  reportData: any[] = [];

  reports: any;

  squadMembers = SQUAD_MEMBERS;

  reportTasks: any[] = [];
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

  membros = ['Todos', 'Italo Silvestre', 'Luiz Arquiteto', 'Gabriel UX'];

  constructor(private taskService: TaskService) {}

  async ngOnInit() {
    this.getActivity();
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
      this.reportData = this.transformToReportData(response);
      this.reportTasks = this.transformToReportTask(response);
      this.totalReport = this.transformToTotalReport(response);
      console.log('rep: ', this.reportData);
      this.createCharts();
    });
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

    new Chart('hoursBySquadChart', {
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

    new Chart('hoursSpentBySquadChart', {
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

    new Chart('taskStatusChart', {
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
