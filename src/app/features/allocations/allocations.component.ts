import {
  AfterContentInit,
  Component,
  ContentChild,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomFilterComponent } from '@components/custom-filter/custom-filter.component';
import {
  CROSS_MEMBERS,
  PRIORITIES,
  RELEASES,
  SPRINTS,
  SQUAD_MEMBERS,
  SquadKey,
} from '@constants/squad.constants';
import { ISquadRequests } from '@indexeddb/models/indexeddb.model';
import { SquadRequestsService } from '@indexeddb/services/squad-requests/squad-requests.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-allocations',
  templateUrl: './allocations.component.html',
  styleUrls: ['./allocations.component.scss'],
})
export class AllocationsComponent implements OnInit, AfterContentInit {
  @Input() flowType: string = '';
  @ContentChild(CustomFilterComponent) filter!: CustomFilterComponent;

  allocations: ISquadRequests[] = [];
  allocationsBackup: ISquadRequests[] = [];
  members: string[] = [];
  sprints = SPRINTS;
  releases = RELEASES;
  squads = Object.keys(SQUAD_MEMBERS);
  prioridades = PRIORITIES;

  selectedMember: string = 'Todos';
  selectedRelease: string = 'Todos';
  selectedSprint: string = 'Todos';
  selectedSquad: string = 'Todos';
  selectedPriority: string = 'Todos';

  editAllocationId: string | null = null;
  isModalOpen = false;
  isEditing = false;
  allocationForm = new FormGroup({
    release: new FormControl('', Validators.required),
    sprint: new FormControl('', Validators.required),
    allocatedHours: new FormControl(1, [
      Validators.required,
      Validators.min(1),
    ]),
    crossName: new FormControl('', Validators.required),
    squad: new FormControl('', Validators.required),
  });

  newAllocation = {
    id: '',
    crossName: '',
    squad: '',
    allocatedHours: 0,
    sprint: '',
    release: '',
  };

  constructor(private squadRequestService: SquadRequestsService) {}

  ngOnInit(): void {
    if (this.flowType === 'cross') {
      this.members = CROSS_MEMBERS;
    }
    this.getLocationData();
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

  onCleanFilter() {
    this.selectedMember = 'Todos';
    this.selectedSprint = 'Todos';
    this.selectedRelease = 'Todos';
    this.selectedSquad = 'Todos';
    this.selectedPriority = 'Todos';
    this.allocations = [...this.allocationsBackup];
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
    } else if (type === 'priority') {
      this.selectedPriority = newValue;
    }

    // Se todos os filtros estão em "Todos", mostra todas as atividades
    if (
      this.selectedMember === 'Todos' &&
      this.selectedSprint === 'Todos' &&
      this.selectedRelease === 'Todos' &&
      this.selectedSquad === 'Todos' &&
      this.selectedPriority === 'Todos'
    ) {
      this.getLocationData();
      return;
    }

    // Filtragem composta com base nos filtros selecionados
    this.allocations = this.allocationsBackup.filter((task) => {
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

  getLocationData() {
    this.squadRequestService.getAllSquadRequests().then((response) => {
      this.allocations = response;
      this.allocationsBackup = response;
    });
  }

  updateActivity(task: any) {
    this.isEditing = true;
    this.editAllocationId = task.id;

    this.filterById(task.id);

    this.openModal();
  }

  filterById(id: string) {
    const column = this.allocations.find((col) => col.id === id);
    if (column) {
      this.allocationForm.patchValue({
        release: column.release,
        sprint: column.sprint,
        allocatedHours: column.allocatedHours,
        crossName: column.crossName,
        squad: column.squad,
      });
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  onSquadChange(squad: string) {
    if (this.flowType === 'squad')
      this.members = SQUAD_MEMBERS[squad as SquadKey];
  }

  onSubmit() {
    if (this.allocationForm.valid) {
      if (this.isEditing && this.editAllocationId) {
        const index = this.allocations.findIndex(
          (a) => a.id === this.editAllocationId
        );

        this.allocations[index] = {
          ...(this.allocationForm.value as Required<ISquadRequests>),
          id: this.editAllocationId!,
        };

        this.squadRequestService.updateSquadRequests(this.allocations[index]);
        this.getLocationData();
      } else {
        const newAllocation: ISquadRequests = {
          ...(this.allocationForm.value as Required<ISquadRequests>),
          id: uuidv4(),
        };
        this.squadRequestService.addSquadRequests(newAllocation).then(() => {
          this.getLocationData();
        });
      }
      this.closeModal();
    }
  }

  deleteAllocation(id: string) {
    this.allocations = this.allocations.filter((s) => s.id !== id);
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editAllocationId = null;
    this.allocationForm.reset();
  }
}
