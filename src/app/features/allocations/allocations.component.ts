import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomFilterComponent } from 'src/app/core/components/custom-filter/custom-filter.component';
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
import { BaseFilterableComponent } from '@components/base/base-filterable.components';

@Component({
  selector: 'app-allocations',
  templateUrl: './allocations.component.html',
  styleUrls: ['./allocations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocationsComponent
  extends BaseFilterableComponent<ISquadRequests>
  implements OnInit, AfterContentInit
{
  @Input() flowType: string = '';
  @ContentChild(CustomFilterComponent) filter!: CustomFilterComponent;

  members: string[] = [];
  sprints = SPRINTS;
  releases = RELEASES;
  squads = Object.keys(SQUAD_MEMBERS);
  prioridades = PRIORITIES;

  editAllocationId: string | null = null;
  isModalOpen = false;
  isEditing = false;

  allocationForm!: FormGroup;

  constructor(
    private squadRequestService: SquadRequestsService,
    private fb: FormBuilder
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    if (this.flowType === 'cross') {
      this.members = CROSS_MEMBERS;
    }
    this.createForm();
    await this.loadData();
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
    this.cdr.markForCheck();
  }

  private createForm(): void {
    this.allocationForm = this.fb.group({
      release: ['', Validators.required],
      sprint: ['', Validators.required],
      allocatedHours: [0, [Validators.required, Validators.min(0)]],
      employeeName: ['', Validators.required],
      squad: ['', Validators.required],
      descricao: [''],
    });
  }

  async loadData(): Promise<void> {
    try {
      const response = await this.squadRequestService.getAllSquadRequests();
      this.data = response;
      this.dataBackup = response;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Erro ao carregar alocações:', error);
    }
  }

  updateActivity(allocation: ISquadRequests): void {
    this.isEditing = true;
    this.editAllocationId = allocation.id;
    this.filterById(allocation.id);
    this.openModal();
  }

  private filterById(id: string): void {
    const allocation = this.data.find((col) => col.id === id);
    if (allocation) {
      this.allocationForm.patchValue({
        release: allocation.release,
        sprint: allocation.sprint,
        allocatedHours: allocation.allocatedHours,
        employeeName: allocation.employeeName,
        squad: allocation.squad,
        descricao: allocation.description,
      });
    }
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  onSquadChange(squad: string): void {
    if (this.flowType === 'squad') {
      this.members = SQUAD_MEMBERS[squad as SquadKey];
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.allocationForm.valid) {
      return;
    }
    const allocationData = this.allocationForm
      .value as Required<ISquadRequests>;

    if (this.isEditing && this.editAllocationId) {
      await this.handleUpdateAllocation(allocationData);
    } else {
      await this.handleCreateAllocation(allocationData);
    }
  }

  private async handleUpdateAllocation(
    allocationData: Required<ISquadRequests>
  ): Promise<void> {
    const allocationIndex = this.data.findIndex(
      (a) => a.id === this.editAllocationId
    );

    if (allocationIndex < 0) {
      console.error('Alocação para atualização não encontrada.');
      return;
    }

    const updatedAllocation: ISquadRequests = {
      ...allocationData,
      id: this.editAllocationId!,
    };

    this.data[allocationIndex] = updatedAllocation;

    try {
      await this.squadRequestService.updateSquadRequests(updatedAllocation);
      await this.loadData();
      this.closeModal();
    } catch (error) {
      console.error('Erro ao atualizar a alocação:', error);
    }
  }

  private async handleCreateAllocation(
    allocationData: Required<ISquadRequests>
  ): Promise<void> {
    const newAllocation: ISquadRequests = {
      ...allocationData,
      id: uuidv4(),
    };

    const duplicateAllocations = this.data.filter(
      (a) =>
        a.squad === allocationData.squad &&
        a.release === allocationData.release &&
        a.sprint === allocationData.sprint &&
        a.employeeName === allocationData.employeeName
    );

    if (duplicateAllocations.length > 0) {
      alert(
        'Já existe alocação cadastrada para essa squad, release, sprint e colaborador'
      );
      return;
    }

    try {
      await this.squadRequestService.addSquadRequests(newAllocation);
      await this.loadData();
      this.closeModal();
    } catch (error) {
      console.error('Erro ao criar a alocação:', error);
    }
  }

  async deleteAllocation(id: string): Promise<void> {
    try {
      await this.squadRequestService.deleteSquadRequests(id);
      await this.loadData();
    } catch (error) {
      console.error('Erro ao deletar a alocação:', error);
    }
  }

  /**
   * Fecha o modal e reseta o estado de edição.
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editAllocationId = null;
    this.allocationForm.reset();
  }
}
