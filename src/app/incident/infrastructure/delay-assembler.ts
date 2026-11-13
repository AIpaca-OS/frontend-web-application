import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Delay } from '../domain/model/delay.entity';
import { DelayResource, DelaysResponse, ReportDelayResource } from './delays-response';

/**
 * Maps delay entities to and from API resources.
 *
 * @remarks
 * Domain `magnitude` holds the estimated minutes and `priority` the backend status.
 */
export class DelayAssembler implements BaseAssembler<Delay, DelayResource, DelaysResponse> {
  /**
   * Converts a DelaysResponse to an array of Delay entities.
   * @param response - The API response containing delays.
   * @returns An array of Delay entities.
   */
  toEntitiesFromResponse = (response: DelaysResponse): Delay[] =>
    response.delays.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a DelayResource to a Delay entity.
   * @param resource - The resource to convert.
   * @returns The converted Delay entity.
   */
  toEntityFromResource = (resource: DelayResource): Delay =>
    new Delay({
      id: resource.id,
      tripId: resource.tripId,
      cause: resource.cause,
      priority: resource.status,
      magnitude: String(resource.estimatedMinutes),
      studentIds: [],
      createdAt: resource.reportedAt,
    });

  /**
   * Converts a Delay entity to a DelayResource.
   * @param entity - The entity to convert.
   * @returns The converted DelayResource.
   */
  toResourceFromEntity = (entity: Delay): DelayResource => ({
    id: entity.id,
    tripId: entity.tripId,
    reportedByProfileId: 0,
    cause: entity.cause,
    estimatedMinutes: parseInt(entity.magnitude, 10),
    status: entity.priority,
    previousDelayId: null,
    reportedAt: entity.createdAt,
  });

  /**
   * Builds the body of POST /delays.
   * @param entity - Delay to report.
   * @param reportedByProfileId - Reporting driver profile.
   * @returns Request body.
   */
  toReportResourceFromEntity = (entity: Delay, reportedByProfileId: number): ReportDelayResource => ({
    tripId: entity.tripId,
    reportedByProfileId,
    cause: entity.cause,
    estimatedMinutes: parseInt(entity.magnitude, 10),
  });
}
