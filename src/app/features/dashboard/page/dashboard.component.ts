import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { IndexedDBService } from 'src/app/core/indexeddb/services/indexeddb.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  reportData = [
    { squad: 'Squad A', allocatedHours: 40, spentHours: 30 },
    { squad: 'Squad B', allocatedHours: 35, spentHours: 28 },
    { squad: 'Squad C', allocatedHours: 50, spentHours: 45 },
  ];
  reports: any;
  reportTasks = [
    { label: 'Backlog', task: 5 },
    { label: 'Em Progresso', task: 8 },
    { label: 'Concluído', task: 18 },
  ];
  membros = ['Todos', 'Italo Silvestre', 'Luiz Arquiteto', 'Gabriel UX']

  constructor(private indexedDBService: IndexedDBService) {}

  async ngOnInit() {
    await this.addDemoReport();
    this.createCharts();
  }

  async addDemoReport() {
    // const newReport = {
    //   id: uuidv4(),
    //   type: 'Alocação',
    //   data: {
    //     squad: 'Squad A',
    //     allocatedHours: 40,
    //     spentHours: 30,
    //   },
    //   generatedDate: new Date(),
    // };
    // await this.indexedDBService.addItem('reports', newReport);
    // this.reports = (await this.indexedDBService.getAllItems('dashboard')) || [];
    // console.log('reports: ', this.reports);
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
