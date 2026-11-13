import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Incident } from '../domain/model/incident.entity';
import { IncidentResource, IncidentsResponse, ReportIncidentResource } from './incidents-response';

/**
 * Maps incident entities to and from API resources.
 *
 * @remarks
 * Domain `title` holds the backend category and `message` the description.
 */
export class IncidentAssembler implements BaseAssembler<Incident, IncidentResource, IncidentsResponse> {
  /**
   * Converts an IncidentsResponse to an array of Incident entities.
   * @param response - The API response containing incidents.
   * @returns An array of Incident entities.
   */
  toEntitiesFromResponse = (response: IncidentsResponse): Incident[] =>
    response.incidents.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts an IncidentResource to an Incident entity.
   * @param resource - The resource to convert.
   * @returns The converted Incident entity.
   */
  toEntityFromResource = (resource: IncidentResource): Incident =>
    new Incident({
      id: resource.id,
      tripId: resource.tripId,
      title: resource.category,
      message: resource.description,
      priority: resource.status,
      studentIds: resource.studentId ? [resource.studentId] : [],
      resolved: resource.status === 'RESOLVED',
      resolvedAt: resource.resolvedAt ?? '',
      createdAt: resource.reportedAt,
    });

  /**
   * Converts an Incident entity to an IncidentResource.
   * @param entity - The entity to convert.
   * @returns The converted IncidentResource.
   */
  toResourceFromEntity = (entity: Incident): IncidentResource => ({
    id: entity.id,
    tripId: entity.tripId,
    reportedByProfileId: 0,
    studentId: entity.studentIds[0] ?? null,
    category: entity.title,
    description: entity.message,
    status: entity.resolved ? 'RESOLVED' : 'OPEN',
    resolution: null,
    reportedAt: entity.createdAt,
    resolvedAt: entity.resolvedAt || null,
    acknowledgements: [],
  });

  /**
   * Builds the body of POST /incidents.
   * @param entity - Incident to report.
   * @param reportedByProfileId - Reporting driver profile.
   * @returns Request body.
   */
  toReportResourceFromEntity = (entity: Incident, reportedByProfileId: number): ReportIncidentResource => ({
    tripId: entity.tripId,
    reportedByProfileId,
    studentId: entity.studentIds[0] ?? null,
    category: entity.title,
    description: entity.message,
  });
}
