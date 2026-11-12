import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Incident } from '../domain/model/incident.entity'
import { IncidentResource, IncidentsResponse } from '../infrastructure/incidents-response'

export class IncidentAssembler implements BaseAssembler<Incident, IncidentResource, IncidentsResponse>
{
  toEntitiesFromResponse(response: IncidentsResponse): Incident[] {

    return response.incidents.map((incident => this.toEntityFromResource(incident)))
  }

  toEntityFromResource(resource: IncidentResource): Incident {
    return new Incident({
      id: resource.id,
      title: resource.title,
      message: resource.message,
      priority: resource.priority,
      studentIds: resource.studentIds,
      resolved: resource.resolved,
      resolvedAt: resource.resolvedAt,
      createdAt: resource.createdAt
    });
  }

  toResourceFromEntity(entity: Incident): IncidentResource {
    return {
      id: entity.id,
      title: entity.title,
      message: entity.message,
      priority: entity.priority,
      studentIds: entity.studentIds,
      resolved: entity.resolved,
      resolvedAt: entity.resolvedAt,
      createdAt: entity.createdAt
    }
  }
}
