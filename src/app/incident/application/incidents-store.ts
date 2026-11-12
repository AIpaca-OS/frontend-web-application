import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';
import { IncidentsApi } from '../infrastructure/incidents-api';
import { Incident } from '../domain/model/incident.entity';
import { Delay } from '../domain/model/delay.entity';

@Injectable({providedIn:'root'})
export class IncidentsStore{
  private readonly incidentsApi=inject(IncidentsApi);
  private readonly incidentsSignal=signal<Incident[]>([]); readonly incidents=this.incidentsSignal.asReadonly();
  private readonly delaysSignal=signal<Delay[]>([]); readonly delays=this.delaysSignal.asReadonly();
  private readonly loadingSignal=signal(false); readonly loading=this.loadingSignal.asReadonly();
  private readonly errorSignal=signal<string|null>(null); readonly error=this.errorSignal.asReadonly();
  readonly incidentsCount=computed(()=>this.incidents().length); readonly delaysCount=computed(()=>this.delays().length);
  constructor(){this.loadIncidents();this.loadDelays();}
  private formatError(error:unknown,fallback:string){return error instanceof Error?(error.message.includes('Resource not found')?`${fallback}: Not found`:error.message):fallback;}
  private loadIncidents(){this.loadingSignal.set(true);this.incidentsApi.getIncidents().pipe(takeUntilDestroyed()).subscribe({next:items=>{this.incidentsSignal.set(items);this.loadingSignal.set(false);},error:e=>{this.errorSignal.set(this.formatError(e,'Failed to load incidents'));this.loadingSignal.set(false);}});}
  private loadDelays(){this.loadingSignal.set(true);this.incidentsApi.getDelays().pipe(takeUntilDestroyed()).subscribe({next:items=>{this.delaysSignal.set(items);this.loadingSignal.set(false);},error:e=>{this.errorSignal.set(this.formatError(e,'Failed to load delays'));this.loadingSignal.set(false);}});}
  getIncidentById(id:number):Signal<Incident|undefined>{return computed(()=>this.incidents().find(x=>x.id===id));}
  addIncident(x:Incident){this.loadingSignal.set(true);this.incidentsApi.createIncident(x).pipe(retry(2)).subscribe({next:y=>{this.incidentsSignal.update(a=>[...a,y]);this.loadingSignal.set(false);},error:e=>{this.errorSignal.set(this.formatError(e,'Failed to create incident'));this.loadingSignal.set(false);}});}
  updateIncident(x:Incident){this.loadingSignal.set(true);this.incidentsApi.updateIncident(x).pipe(retry(2)).subscribe({next:y=>{this.incidentsSignal.update(a=>a.map(i=>i.id===y.id?y:i));this.loadingSignal.set(false);},error:e=>{this.errorSignal.set(this.formatError(e,'Failed to update incident'));this.loadingSignal.set(false);}});}
  deleteIncident(id:number){this.loadingSignal.set(true);this.incidentsApi.deleteIncident(id).pipe(retry(2)).subscribe({next:()=>{this.incidentsSignal.update(a=>a.filter(i=>i.id!==id));this.loadingSignal.set(false);},error:e=>{this.errorSignal.set(this.formatError(e,'Failed to delete incident'));this.loadingSignal.set(false);}});}
  getDelayById(id:number):Signal<Delay|undefined>{return computed(()=>this.delays().find(x=>x.id===id));}
  addDelay(x:Delay){this.loadingSignal.set(true);this.incidentsApi.createDelay(x).pipe(retry(2)).subscribe({next:y=>{this.delaysSignal.update(a=>[...a,y]);this.loadingSignal.set(false);},error:e=>{this.errorSignal.set(this.formatError(e,'Failed to create delay'));this.loadingSignal.set(false);}});}
  updateDelay(x:Delay){this.loadingSignal.set(true);this.incidentsApi.updateDelay(x).pipe(retry(2)).subscribe({next:y=>{this.delaysSignal.update(a=>a.map(i=>i.id===y.id?y:i));this.loadingSignal.set(false);},error:e=>{this.errorSignal.set(this.formatError(e,'Failed to update delay'));this.loadingSignal.set(false);}});}
  deleteDelay(id:number){this.loadingSignal.set(true);this.incidentsApi.deleteDelay(id).pipe(retry(2)).subscribe({next:()=>{this.delaysSignal.update(a=>a.filter(i=>i.id!==id));this.loadingSignal.set(false);},error:e=>{this.errorSignal.set(this.formatError(e,'Failed to delete delay'));this.loadingSignal.set(false);}});}
}
