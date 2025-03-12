import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  CROSS_MEMBERS,
  PRIORITIES,
  RELEASES,
  SPRINTS,
  SQUAD_MEMBERS,
  SquadKey,
} from '@constants/squad.constants';
import { Filter } from 'src/app/shared/models/filter.model';

@Component({
  selector: 'app-custom-filter',
  templateUrl: './custom-filter.component.html',
  styleUrls: ['./custom-filter.component.scss'],
})
export class CustomFilterComponent implements OnInit {
  @Input() flowType: string = '';
  @Input() showPriority: boolean = true;
  @Input() selectedFilter!: Filter;
  @Output() filterChangeEmmiter = new EventEmitter<{
    event: string;
    value: string;
  }>();

  @Output() cleanFilterEmitter = new EventEmitter<boolean>();

  members: string[] = [];
  sprints = SPRINTS;
  releases = RELEASES;
  squads = Object.keys(SQUAD_MEMBERS);
  priorities = PRIORITIES;

  selectedMember: string = 'Todos';
  selectedRelease: string = 'Todos';
  selectedSprint: string = 'Todos';
  selectedSquad: string = 'Todos';
  selectedPriority: string = 'Todos';


  ngOnInit(): void {
    // this.eventBusService.getEvent<Filter>('filter').subscribe((filter) => {
    //   if (filter) {
    //     this.selectedRelease = filter.release;
    //     this.selectedSprint = filter.sprint;
    //     this.selectedSquad = filter.squad;
    //   }
    // });

    if (this.flowType === 'cross') {
      this.members = CROSS_MEMBERS;
    }

    // if (this.selectedFilter) {
    //   this.selectedRelease = this.selectedFilter.release;
    //   this.selectedSprint = this.selectedFilter.sprint;
    //   this.selectedSquad = this.selectedFilter.squad
    //   this.filterChangeEmmiter.emit({
    //     event: 'squad',
    //     value: this.selectedSquad
    //   })
    //   this.filterChangeEmmiter.emit({
    //     event: 'release',
    //     value: this.selectedRelease
    //   })
    //   this.filterChangeEmmiter.emit({
    //     event: 'sprint',
    //     value: this.selectedSprint
    //   })
    // }
  }

  onFilterChange(newValue: string, type: string): void {
    this.filterChangeEmmiter.emit({
      event: type,
      value: newValue,
    });

    if (type === 'squad' && this.flowType == 'squad') {
      this.members = SQUAD_MEMBERS[newValue as SquadKey];
    }
  }

  cleanFilters() {
    this.selectedMember = 'Todos';
    this.selectedRelease = 'Todos';
    this.selectedSprint = 'Todos';
    this.selectedSquad = 'Todos';
    this.selectedPriority = 'Todos';

    this.cleanFilterEmitter.emit(true);
  }
}
