import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubjects: { [eventId: string]: BehaviorSubject<any> } = {};


  getEvent<T>(eventId: string): Observable<T | null> {
    if (!this.eventSubjects[eventId]) {
      this.eventSubjects[eventId] = new BehaviorSubject<T | null>(null);
    }
    return this.eventSubjects[eventId].asObservable();
  }

  /**
   * Envia dados para o evento identificado por eventId.
   * Se o BehaviorSubject para esse ID ainda não existir, ele é criado com o valor enviado.
   */
  sendEvent<T>(eventId: string, data: T): void {
    if (!this.eventSubjects[eventId]) {
      this.eventSubjects[eventId] = new BehaviorSubject<T | null>(data);
    } else {
      this.eventSubjects[eventId].next(data);
    }
  }
}
