import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  CROSS_MEMBERS,
  PRIORITIES,
  RELEASES,
  SPRINTS,
  SQUAD_MEMBERS,
  SquadKey,
} from '@constants/squad.constants';

@Component({
  selector: 'app-custom-filter',
  templateUrl: './custom-filter.component.html',
  styleUrls: ['./custom-filter.component.scss'],
})
export class CustomFilterComponent implements OnInit {
  @Input() flowType: string = '';
  @Output() filterChangeEmmiter = new EventEmitter<{
    event: string;
    value: string;
  }>();

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
    if (this.flowType === 'cross') {
      this.members = CROSS_MEMBERS;
    }
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
}
