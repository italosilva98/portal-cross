import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RELEASES, SPRINTS, SQUAD_MEMBERS } from '@constants/squad.constants';
import { Filter } from 'src/app/shared/models/filter.model';

@Component({
  selector: 'app-filter-card',
  templateUrl: './filter-card.component.html',
  styleUrls: ['./filter-card.component.scss'],
})
export class FilterCardComponent implements OnInit {
  @Output() applyFilterEmitter = new EventEmitter<Filter>();

  ngOnInit(): void {
    this.sprints.push('Todos');
    this.releases.push('Todos');
    this.squads.push('Todos');
  }
  sprints = SPRINTS;
  releases = RELEASES;
  squads = Object.keys(SQUAD_MEMBERS);

  selectedSquad: string = '';
  selectedRelease: string = '';
  selectedSprint: string = '';

  applyFilter() {
    this.applyFilterEmitter.emit({
      squad: this.selectedSquad,
      release: this.selectedRelease,
      sprint: this.selectedSprint,
    });
  }
}
