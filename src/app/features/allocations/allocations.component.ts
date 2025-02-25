import { Component } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-allocations',
  templateUrl: './allocations.component.html',
  styleUrls: ['./allocations.component.scss'],
})
export class AllocationsComponent {
  allocations = [
    {
      id: uuidv4(),
      name: 'Ítalo',
      squad: 'Tron',
      hours: 40,
      sprint: 'Sprint 1',
    },
    {
      id: uuidv4(),
      name: 'Ítalo',
      squad: 'Clix',
      hours: 30,
      sprint: 'Sprint 1',
    },
  ];

  isModalOpen = false;
  isEditing = false;
  allocationForm = { id: '', name: '', squad: '', hours: 0, sprint: '' };
  membros = ['Todos', 'Italo Silvestre', 'Luiz Arquiteto', 'Gabriel UX']


  constructor() {
    // this.getSprintData();
  }

  // async getSprintData() {
  //   const response = (await this.indexedDBService.getAllItems('sprints')) || [];
  //   this.result = response;
  //   this.result.forEach((sprint) => {
  //     this.sprints.push(sprint);
  //   });
  // }


  openNewAllocationModal() {
    this.isModalOpen = true;
    this.isEditing = false;
    this.allocationForm = {
      id: '',
      name: '',
      squad: '',
      hours: 0,
      sprint: '',
    };
  }

  editAllocation(allocation: any) {
    this.isModalOpen = true;
    this.isEditing = true;
    this.allocationForm = { ...allocation };
  }

  saveAllocation() {
    if (this.isEditing) {
      const index = this.allocations.findIndex(
        (s) => s.id === this.allocationForm.id
      );
      this.allocations[index] = { ...this.allocationForm };
    } else {
      const id = uuidv4();
      this.allocationForm.id = id;

      // const newReport = {
      //   id: id,
      //   type: 'SprintData',
      //   data: { ...this.sprintForm },
      //   generatedDate: new Date(),
      // };
      // const task: Task = {
      //   id: '2',
      //   title: 'string2',
      //   description: 'string2',
      //   status: 'string2',
      //   sprintId: 'sprint2',
      //   allocatedHours: 10,
      //   spentHours: 5,
      //   createdDate: new Date(),
      //   updatedDate: new Date(),
      // };
      // const sprint: Sprint = {
      //   id: 'sprint1',
      //   title: 'string2',
      //   allocatedHours: 10,
      //   startDate: new Date(),
      //   endDate: new Date(),
      //   status: 'status',
      // };

      // this.sprints.push({ ...this.sprintForm });
      // // this.indexedDBService.addItem('sprints', sprint);

      // console.log(
      //   'getTasksBySprint: ',
      //   this.indexedDBService.getTasksBySprint('sprint1')
      // );
    }
    this.closeModal();
  }

  deleteAllocation(id: string) {
    this.allocations = this.allocations.filter((s) => s.id !== id);
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
